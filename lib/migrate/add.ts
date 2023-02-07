import { Project } from 'https://deno.land/x/ts_morph@17.0.1/mod.ts';

function nowAsString(): string {
	const now = new Date();

	return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(
		2,
		'0'
	)}${String(now.getUTCDate()).padStart(2, '0')}${String(
		now.getUTCHours()
	).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(
		now.getUTCSeconds()
	).padStart(2, '0')}`;
}

export async function addMigration(
	migrationDescription: string
): Promise<void> {
	const description = migrationDescription.replaceAll(' ', '_');
	const migrationName = `${nowAsString()}_${description}.sql`;
	console.log(`Creating migration ${migrationName}`);

	// TODO: Don't use ts-morph for this
	const project = new Project();

	project.addSourceFilesAtPaths('.');
	project.createSourceFile(
		`migrations/${migrationName}`,
		'-- Add migration script here',
		{ overwrite: true }
	);

	await project.save();
}
