import { printNode, Project, SourceFile, ts } from 'ts-morph';
import Surreal from 'https://deno.land/x/surrealdb@v0.5.0/mod.ts';
import { SurrealXClassStatements, typeUtilsStatements } from './constants.ts';
import { infoForDb, infoForTable } from './utils/infoForDb.ts';
import { capitalize } from './utils/capitalize.ts';
import {
	createStringLiteralUnionTypeAlias,
	createTableType,
	createTableTypesInterface,
} from './utils/index.ts';
import { addComment } from './utils/addComment.ts';
import { SurrealXMigrationTableName } from '../migrate/run.ts';
const { factory } = ts;

export async function generate(db: Surreal, output: string) {
	const project = new Project();

	const genFile = project.createSourceFile(
		output,
		`import Surreal from 'https://deno.land/x/surrealdb@v0.5.0/mod.ts';
import { DeepPick, DeepPickPath } from 'npm:ts-deep-pick';`,
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

	const tables = Object.entries(dbInfo.tb).filter(
		([n]) => n !== SurrealXMigrationTableName
	);
	const tableNames = tables.map(([name]) => name);
	if (tables.length === 0) {
		throw new Error(
			'Your database is empty. Perhaps you forgot to run migrations'
		);
	}

	for (const [tableName, tableDefinition] of tables) {
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
