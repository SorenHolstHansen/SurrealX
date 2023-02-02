import Surreal from 'surrealdb';

type InitDbParams = {
	url?: string;
	token?: string;
	user: string;
	pass: string;
	ns: string;
	db: string;
};

export async function withDB(
	{ url, token, user, pass, ns, db: database }: InitDbParams,
	callback: (db: Surreal) => Promise<void>
): Promise<void> {
	const db = new Surreal(url, token);
	await db.signin({
		user,
		pass,
	});
	await db.use(ns, database);

	await callback(db);

	db.close();
}
