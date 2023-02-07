import Surreal from 'https://deno.land/x/surrealdb@v0.5.0/mod.ts';

type InitDbParams = {
	url?: string;
	token?: string;
	user: string;
	pass: string;
	ns: string;
	db: string;
};

export async function withDB<T>(
	{ url, token, user, pass, ns, db: database }: InitDbParams,
	callback: (db: Surreal) => Promise<T>
): Promise<T> {
	const db = new Surreal(url, token);
	try {
		await db.signin({
			user,
			pass,
		});
		await db.use(ns, database);

		return await callback(db);
	} finally {
		db.close();
	}
}
