import { ts } from 'ts-morph';
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
