import Surreal from 'surrealdb';

type InitDbParams = {
	url?: string;
	token?: string;
	user: string;
	pass: string;
	ns: string;
	db: string;
};

export async function initDb({
	url,
	token,
	user,
	pass,
	ns,
	db: database,
}: InitDbParams): Promise<Surreal> {
	const db = new Surreal(url, token);
	await db.signin({
		user,
		pass,
	});

	// Select a specific namespace / database
	await db.use(ns, database);

	return db;
}
