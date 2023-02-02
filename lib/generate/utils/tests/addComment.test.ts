import { ts, printNode } from 'ts-morph';
import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { addComment } from '../addComment.ts';

Deno.test('createTableType', () => {
	const type = addComment(
		ts.factory.createTypeAliasDeclaration(
			undefined,
			ts.factory.createIdentifier('Test'),
			undefined,
			ts.factory.createUnionTypeNode([
				ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('a')),
			])
		),
		'Hi',
		'There'
	);
	const node = printNode(type);
	assertEquals(
		node,
		`/**
 * Hi
 * There
*/
type Test = "a";`
	);
});
