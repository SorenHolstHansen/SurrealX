import { Project, ts, printNode, SourceFile } from 'ts-morph';
import Surreal from 'surrealdb';
import { SurrealXClassStatements, typeUtilsStatements } from './constants.ts';
import { infoForDb, infoForTable } from '../utils/infoForDb.ts';
import { capitalize } from '../utils/capitalize.ts';
import {
	createStringLiteralUnionTypeAlias,
	createTableTypesInterface,
} from './utils.ts';
import { nameof } from 'https://deno.land/x/ts_morph@17.0.1/common/ts_morph_common.d.ts';
const { factory } = ts;

export async function generate(db: Surreal, output: string) {
	const project = new Project();

	const genFile = project.createSourceFile(
		output,
		`import Surreal from 'surrealdb';`,
		{ overwrite: true }
	);

	genFile.addStatements(typeUtilsStatements);

	// Add the types for all the tables
	await addTablesWithTypes(db, genFile);

	genFile.addStatements(SurrealXClassStatements);

	genFile.formatText();

	await project.save();
}

async function addTablesWithTypes(
	db: Surreal,
	genFile: SourceFile
): Promise<void> {
	const dbInfo = await infoForDb(db);

	if (dbInfo == null) {
		throw new Error('Error');
	}

	const tableNames = Object.keys(dbInfo.tb);

	for (const [tableName, tableDefinition] of Object.entries(dbInfo.tb)) {
		const isSchemafull = tableDefinition.includes('SCHEMAFULL');
		if (!isSchemafull) {
			// sample the database for the type if the user wants
			genFile.addStatements(
				`export type ${capitalize(tableName)} = Record<string, unknown>;`
			);
			continue;
		} else {
			genFile.addStatements(
				printNode(await createTableTypeAlias(db, tableName))
			);
		}
	}

	genFile.addStatements(
		printNode(createStringLiteralUnionTypeAlias('TableName', tableNames, true))
	);

	genFile.addStatements(printNode(createTableTypesInterface(tableNames)));
}

const surrealTypeNameToTsTypeIdentifier: Record<
	string,
	ts.KeywordTypeSyntaxKind
> = {
	string: ts.SyntaxKind.StringKeyword,
	int: ts.SyntaxKind.NumberKeyword,
	decimal: ts.SyntaxKind.NumberKeyword,
	float: ts.SyntaxKind.NumberKeyword,
	boolean: ts.SyntaxKind.BooleanKeyword,
};

async function createTableTypeAlias(
	db: Surreal,
	tableName: string
): Promise<ts.Node> {
	const tableInfo = await infoForTable(db, tableName);
	if (tableInfo == null) throw new Error('ERROR!');

	const fieldInfo = Object.entries(tableInfo.fd).map(([name, definition]) => ({
		name,
		definition,
	}));

	return factory.createTypeAliasDeclaration(
		[factory.createToken(ts.SyntaxKind.ExportKeyword)],
		factory.createIdentifier(capitalize(tableName)),
		undefined,
		createTableType(fieldInfo)
	);
}

type FieldInfo = { name: string; definition: string };

function createTableType(
	fieldInfo: FieldInfo[],
	/**
	 * e.g. children of `name`, so fieldInfo would be fields like `name.first`, `name.last` and so on.
	 * If undefined, this is the base layer
	 */
	parentField?: string
): ts.TypeNode {
	let baseFields: FieldInfo[] = fieldInfo;
	if (parentField == null) {
		// base layer
		baseFields = fieldInfo.filter((f) => !f.name.includes('.'));
	}

	if (baseFields.length === 1 && baseFields[0].name.endsWith('.*')) {
		// parent is an array
		const { name, definition } = baseFields[0];
		const type = definition.match(/TYPE (\w+)/)?.[1] ?? 'string';
		if (type === 'object') {
			return createTableType(
				fieldInfo.filter((f) => f.name.startsWith(`${name}.`)),
				name
			);
		} else if (type === 'array') {
			return factory.createArrayTypeNode(
				createTableType(
					fieldInfo.filter((f) => f.name.startsWith(`${name}.`)),
					name
				)
			);
		} else {
			return factory.createKeywordTypeNode(
				surrealTypeNameToTsTypeIdentifier[type]
			);
		}
	}

	return factory.createTypeLiteralNode(
		baseFields.map(({ name: _name, definition }) => {
			const name = _name.split('.').at(-1)!;
			const type = definition.match(/TYPE (\w+)/)?.[1] ?? 'string';
			if (type === 'object') {
				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(name),
					undefined,
					createTableType(
						fieldInfo.filter((f) => f.name.startsWith(`${name}.`)),
						name
					)
				);
			} else if (type === 'array') {
				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(name),
					undefined,
					factory.createArrayTypeNode(
						createTableType(
							fieldInfo.filter((f) => f.name.startsWith(`${name}.`)),
							name
						)
					)
				);
			} else {
				return factory.createPropertySignature(
					undefined,
					factory.createIdentifier(name),
					undefined,
					factory.createKeywordTypeNode(surrealTypeNameToTsTypeIdentifier[type])
				);
			}
		})
	);
}
