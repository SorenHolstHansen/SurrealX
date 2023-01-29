import { SurrealX } from './surrealx.ts';

const db = new SurrealX('http://127.0.0.1:8000/rpc');

async function main() {
	try {
		console.log('Starting');
		// Signin as a namespace, database, or root user
		await db.signin({
			user: 'root',
			pass: 'root',
		});

		// Select a specific namespace / database
		await db.use('test', 'test');
		const info = await db.query(`INFO FOR db;`);
		console.log({ info: info[0].result });

		const tableInfo = await db.query(`INFO FOR TABLE person`);
		console.log({ personTableInfo: tableInfo[0].result });

		// Create a new person with a random id
		const created = await db.createX('person', {
			title: 'Founder & CEO',
			name: {
				first: 'Tobie',
				last: 'Morgan Hitchcock',
			},
			marketing: true,
			identifier: Math.random().toString(36).substr(2, 10),
		});
		console.log({ created });

		// Update a person record with a specific id
		const updated = await db.changeX('person:jaime', {
			marketing: true,
		});
		console.log({ updated });

		// Select all people records
		const people = await db.selectAllX('person');
		console.log({ people });
		let p = await db.selectX('person:67k7ez84wey644cuimo7');
		console.log({ p });

		// Perform a custom advanced query
		const groups = await db.query(
			'SELECT marketing, count() FROM type::table($tb) GROUP BY marketing',
			{
				tb: 'person',
			}
		);
		console.log({ groups });
	} catch (e) {
		console.error('ERROR', e);
	}
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
	await main();
	db.close();
}
