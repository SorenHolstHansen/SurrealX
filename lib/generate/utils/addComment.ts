import { ts } from 'ts-morph';

export function addComment(node: any, comments: string | string[]) {
	const commentLines = Array.isArray(comments) ? comments : [comments];
	return ts.addSyntheticLeadingComment(
		node,
		ts.SyntaxKind.MultiLineCommentTrivia,
		`*\n${commentLines.map((c) => ` * ${c}\n`).join('')}`,
		true // add a trailing newline after */
	);
}
