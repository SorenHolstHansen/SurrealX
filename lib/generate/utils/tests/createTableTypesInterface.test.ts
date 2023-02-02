import { printNode } from 'ts-morph';
import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { createTableTypesInterface } from '../createTableTypesInterface.ts';

Deno.test('createTableType', () => {
	const type = createTableTypesInterface(['tableA', 'myTable']);
	const node = printNode(type);
	assertEquals(
		node,
		`export interface TableTypes extends Record<TableName, Record<string, unknown>> {
    tableA: TableA;
    myTable: MyTable;
}`
	);
});
