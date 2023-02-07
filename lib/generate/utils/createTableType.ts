import { ts } from 'https://deno.land/x/ts_morph@17.0.1/mod.ts';
import { addComment } from './addComment.ts';
const { factory } = ts;

const surrealTypeNameToTsTypeIdentifier: Record<
	string,
	ts.KeywordTypeSyntaxKind
> = {
	string: ts.SyntaxKind.StringKeyword,
	int: ts.SyntaxKind.NumberKeyword,
	decimal: ts.SyntaxKind.NumberKeyword,
	float: ts.SyntaxKind.NumberKeyword,
	boolean: ts.SyntaxKind.BooleanKeyword,
};

type FieldInfo = { name: string; definition: string };

/**
 * Creates the type alias for a table given the field info. The parentField should not be used directly
 */
export function createTableType(
	fieldInfo: FieldInfo[],
	/**
	 * e.g. children of `name`, so fieldInfo would be fields like `name.first`, `name.last` and so on.
	 * If undefined, this is the base layer
	 */
	parentField?: string
): ts.TypeNode {
	let baseFields: FieldInfo[] = [];
	if (parentField == null) {
		// base layer
		baseFields = fieldInfo.filter(
			(f) => !f.name.includes('.') && !f.name.includes('[*]')
		);
	} else {
		baseFields = fieldInfo.filter(
			(f) => !f.name.replace(`${parentField}.`, '').includes('.')
		);
	}

	if (baseFields.length === 1 && baseFields[0].name.endsWith('[*]')) {
		// parent is an array
		const { name, definition } = baseFields[0];
		const type = definition.match(/TYPE (\w+)/)?.[1] ?? 'string';
		if (type === 'object') {
			return createTableType(
				fieldInfo.filter((f) => f.name.startsWith(`${name}.`)),
				name
			);
		} else if (type === 'array') {
			return factory.createArrayTypeNode(
				createTableType(
					fieldInfo.filter((f) => f.name.startsWith(`${name}[*]`)),
					name
				)
			);
		} else {
			return factory.createKeywordTypeNode(
				surrealTypeNameToTsTypeIdentifier[type]
			);
		}
	}

	return factory.createTypeLiteralNode(
		baseFields.map(({ name: _name, definition }) => {
			const name = _name.split('.').at(-1)!.replace('[*]', '');
			const type = definition.match(/TYPE (\w+)/)?.[1] ?? 'string';
			const isOptional = !/ASSERT \$value != NONE/.test(definition);
			const questionMark = isOptional
				? factory.createToken(ts.SyntaxKind.QuestionToken)
				: undefined;
			if (type === 'object') {
				return addComment(
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier(name),
						questionMark,
						createTableType(
							fieldInfo.filter((f) => f.name.startsWith(`${_name}.`)),
							_name
						)
					),
					'Definition:',
					'```sql',
					definition.replace('*/', '[REPLACED]'),
					'```'
				);
			} else if (type === 'array') {
				return addComment(
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier(name),
						questionMark,
						factory.createArrayTypeNode(
							createTableType(
								fieldInfo.filter((f) => f.name.startsWith(`${_name}[*]`)),
								_name
							)
						)
					),
					'Definition:',
					'```sql',
					definition.replace('*/', '[REPLACED]'),
					'```'
				);
			} else {
				return addComment(
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier(name),
						questionMark,
						factory.createKeywordTypeNode(
							surrealTypeNameToTsTypeIdentifier[type]
						)
					),
					'Definition:',
					'```sql',
					definition.replace('*/', '[REPLACED]'),
					'```'
				);
			}
		})
	);
}
