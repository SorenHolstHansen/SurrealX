import { Project } from 'ts-morph';

export async function addMigration(
	migrationDescription: string
): Promise<void> {
	const timestamp = Date.now(); // TODO: Maybe use something other than now. sqlx does 20230128204613_<name>.sql
	const migrationName = `${timestamp}_${migrationDescription}.sql`;
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
