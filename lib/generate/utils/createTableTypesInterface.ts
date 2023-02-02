import { ts, printNode } from 'ts-morph';
import { capitalize } from '../utils/capitalize.ts';
import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
const { factory } = ts;

export function createTableTypesInterface(tableNames: string[]): ts.Node {
	return factory.createInterfaceDeclaration(
		[factory.createToken(ts.SyntaxKind.ExportKeyword)],
		factory.createIdentifier('TableTypes'),
		undefined,
		[
			factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
				factory.createExpressionWithTypeArguments(
					factory.createIdentifier('Record'),
					[
						factory.createTypeReferenceNode(
							factory.createIdentifier('TableName'),
							undefined
						),
						factory.createTypeReferenceNode(
							factory.createIdentifier('Record'),
							[
								factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
								factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
							]
						),
					]
				),
			]),
		],
		tableNames.map((tableName) =>
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier(tableName),
				undefined,
				factory.createTypeReferenceNode(
					factory.createIdentifier(capitalize(tableName)),
					undefined
				)
			)
		)
	);
}

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
