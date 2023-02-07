import { ts } from 'https://deno.land/x/ts_morph@17.0.1/mod.ts';
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
