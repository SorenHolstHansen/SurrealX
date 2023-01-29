import Surreal from 'surrealdb';
import { infoForDb, infoForTable } from '../utils/infoForDb.ts';

export type Field = {
	name: string;
	type: string;
	isOptional: boolean;
};

export type TableMeta = {
	name: string;
	isSchemafull: boolean;
	fields: Field[];
};

export async function extractTableMeta(db: Surreal): Promise<TableMeta[]> {
	const dbInfo = await infoForDb(db);

	if (dbInfo == null) {
		throw new Error('Error');
	}

	const tables: TableMeta[] = [];

	for (const [tableName, tableDefinition] of Object.entries(dbInfo.tb)) {
		const isSchemafull = tableDefinition.includes('SCHEMAFULL');
		const fields: Field[] = [];
		if (isSchemafull) {
			const tableInfo = await infoForTable(db, tableName);
			if (tableInfo == null) throw new Error('Error');
			const { fd } = tableInfo;
			for (const [field, fieldDefinition] of Object.entries(fd)) {
				const type = fieldDefinition.match(/TYPE (\w+)/)?.[1];
				fields.push({ name: field, type: type ?? 'string', isOptional: true });
			}
		}
		tables.push({
			name: tableName,
			isSchemafull,
			fields,
		});
	}

	// console.log('dbInfo');
	// console.log(dbInfo);
	// console.log(tables);

	return tables;
}
