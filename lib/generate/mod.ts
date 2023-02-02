import { Project, ts, printNode, SourceFile } from 'ts-morph';
import Surreal from 'surrealdb';
import { SurrealXClassStatements, typeUtilsStatements } from './constants.ts';
import { infoForDb, infoForTable } from './utils/infoForDb.ts';
import { capitalize } from './utils/capitalize.ts';
import {
	createStringLiteralUnionTypeAlias,
	createTableType,
	createTableTypesInterface,
} from './utils/index.ts';
import { addComment } from './utils/addComment.ts';
const { factory } = ts;

export async function generate(db: Surreal, output: string) {
	const project = new Project();

	const genFile = project.createSourceFile(
		output,
		`import Surreal from 'surrealdb';
import { DeepPick, DeepPickPath, DefaultGrammar } from 'npm:ts-deep-pick';`,
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
	if (tableNames.length === 0) {
		throw new Error(
			'Your database is empty. Perhaps you forgot to run migrations'
		);
	}

	for (const [tableName, tableDefinition] of Object.entries(dbInfo.tb)) {
		const isSchemafull = tableDefinition.includes('SCHEMAFULL');
		if (!isSchemafull) {
			// sample the database for the type if the user wants
			genFile.addStatements([
				`/**
 * Definition:
 * \`\`\`sql
 * ${tableDefinition}
 * \`\`\`
 */`,
				`export type ${capitalize(tableName)} = Record<string, unknown>;`,
			]);
			continue;
		} else {
			genFile.addStatements(
				printNode(
					addComment(
						await createTableTypeAlias(db, tableName),
						'Definition:',
						'```sql',
						tableDefinition,
						'```'
					)
				)
			);
		}
	}

	genFile.addStatements(
		printNode(createStringLiteralUnionTypeAlias('TableName', tableNames, true))
	);

	genFile.addStatements(printNode(createTableTypesInterface(tableNames)));
}

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
