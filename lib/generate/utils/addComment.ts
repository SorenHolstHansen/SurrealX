import { ts } from 'ts-morph';

export function addComment(node: any, ...comments: string[]) {
	return ts.addSyntheticLeadingComment(
		node,
		ts.SyntaxKind.MultiLineCommentTrivia,
		`*\n${comments.map((c) => ` * ${c}\n`).join('')}`,
		true // add a trailing newline after */
	);
}
