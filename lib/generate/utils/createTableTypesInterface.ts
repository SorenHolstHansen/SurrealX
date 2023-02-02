import { ts } from 'ts-morph';
import { capitalize } from '../utils/capitalize.ts';
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
