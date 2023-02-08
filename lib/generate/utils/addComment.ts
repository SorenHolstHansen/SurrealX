import { ts } from 'https://deno.land/x/ts_morph@17.0.1/mod.ts';

export function addComment(node: ts.Node, ...comments: string[]) {
	return ts.addSyntheticLeadingComment(
		node,
		ts.SyntaxKind.MultiLineCommentTrivia,
		`*\n${comments.map((c) => ` * ${c}\n`).join('')}`,
		true // add a trailing newline after */
	);
}
