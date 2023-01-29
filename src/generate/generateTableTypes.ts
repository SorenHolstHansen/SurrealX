import { capitalize } from '../utils/capitalize.ts';
import { Field, TableMeta } from './extractTableInfo.ts';
import { SourceFile } from 'ts-morph';

function generateTableType(table: TableMeta): string {
	const tableName = capitalize(table.name);
	if (!table.isSchemafull) {
		// TODO: Sample database if user wants it
		return `export type ${tableName} = Record<string, unknown>;`;
	}
	console.log({ table });

	const returnType = [`export type ${tableName} = {`];

	const fields = table.fields;
	while (fields.length > 0) {
		const { type, name, isOptional } = fields.shift() as Field;
		if (type !== 'object') {
			returnType.push(`${name}${isOptional ? '?' : ''}: ${type};`);
			continue;
		} else {
			returnType.push(`${name}${isOptional ? '?' : ''}: {`);

			returnType.push(`};`);
		}
	}

	returnType.push('};');

	return returnType.join('\n');
}

export function addTableTypes(genFile: SourceFile, tables: TableMeta[]): void {
	const tableNameType = tables.map(({ name }) => `"${name}"`).join(' | ');

	const newContent = `export type TableName = ${tableNameType};

${tables.map((table) => generateTableType(table)).join('\n')}

export interface TableTypes extends Record<TableName, Record<string, unknown>> {
    ${tables.map(({ name }) => `${name}: ${capitalize(name)};`).join('\n\t')}
}
        `;

	genFile.addStatements(newContent);
}
