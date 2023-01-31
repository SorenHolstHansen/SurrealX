import { ts, printNode } from 'ts-morph';
import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { addComment } from './addComment.ts';
const { factory } = ts;

export function createStringLiteralUnionTypeAlias(
	typeName: string,
	types: string[],
	shouldExport = false
): ts.Node {
	return addComment(
		factory.createTypeAliasDeclaration(
			shouldExport
				? [factory.createToken(ts.SyntaxKind.ExportKeyword)]
				: undefined,
			factory.createIdentifier(typeName),
			undefined,
			factory.createUnionTypeNode(
				types.map((t) =>
					factory.createLiteralTypeNode(factory.createStringLiteral(t))
				)
			)
		),
		'Names of tables in the database'
	);
}

Deno.test('createTableType', () => {
	const type = createStringLiteralUnionTypeAlias('MyType', ['a', 'b'], true);
	const node = printNode(type);
	assertEquals(node, `export type MyType = "a" | "b";`);
});
