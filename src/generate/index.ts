import { Project, ts, createWrappedNode, printNode } from 'ts-morph';
import Surreal from 'surrealdb';
import { SurrealXClassStatements, typeUtilsStatements } from './constants.ts';
import { infoForDb } from '../utils/infoForDb.ts';
import { capitalize } from '../utils/capitalize.ts';
const { factory } = ts;

export async function generate(db: Surreal, output: string) {
	const project = new Project();

	const tablesWithTypesPromise = getTablesWithTypes(db);

	const genFile = project.createSourceFile(
		output,
		`import Surreal from 'surrealdb';`,
		{ overwrite: true }
	);

	genFile.addStatements(typeUtilsStatements);

	// Add the types for all the tables
	const tablesWithTypes = await tablesWithTypesPromise;
	genFile.addStatements(
		tablesWithTypes
			.map(
				({ stringifiedType, capitalizedTableName }) =>
					`export type ${capitalizedTableName} = ${stringifiedType};`
			)
			.join('\n')
	);
	genFile.addStatements(
		`export type TableName = ${tablesWithTypes
			.map(({ tableName }) => `"${tableName}"`)
			.join(' | ')};`
	);
	genFile.addStatements(
		`export interface TableTypes extends Record<TableName, Record<string, unknown>> {
    ${tablesWithTypes
			.map(
				({ tableName, capitalizedTableName }) =>
					`${tableName}: ${capitalizedTableName};`
			)
			.join('\n\t')}
}`
	);

	const type = factory.createTypeAliasDeclaration(
		[factory.createToken(ts.SyntaxKind.ExportKeyword)],
		factory.createIdentifier('MyType'),
		undefined,
		factory.createTypeLiteralNode([
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('name'),
				undefined,
				factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
			),
		])
	);
	const classDec = createWrappedNode(type);

	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

	const result = printer.printNode(
		ts.EmitHint.Unspecified,
		type,
		genFile.compilerNode
	);
	console.log({ result });

	genFile.addStatements(SurrealXClassStatements);

	genFile.formatText();

	await project.save();
}

type TableMeta = {
	tableName: string;
	capitalizedTableName: string;
	stringifiedType: string;
};

async function getTablesWithTypes(db: Surreal): Promise<TableMeta[]> {
	const dbInfo = await infoForDb(db);

	if (dbInfo == null) {
		throw new Error('Error');
	}

	const tableMeta: TableMeta[] = [];

	for (const [tableName, tableDefinition] of Object.entries(dbInfo.tb)) {
		const isSchemafull = tableDefinition.includes('SCHEMAFULL');
		if (!isSchemafull) {
			// sample the database for the type if the user wants
			tableMeta.push({
				tableName,
				capitalizedTableName: capitalize(tableName),
				stringifiedType: 'Record<string, unknown>',
			});
			continue;
		} else {
			const stringifiedType = `{}`;
			tableMeta.push({
				tableName,
				capitalizedTableName: capitalize(tableName),
				stringifiedType,
			});
		}
	}

	return tableMeta;
}
