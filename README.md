# SurrealX

A strongly typed SurrealDB client.

SurrealX is a CLI that generates a strongly typed client for SurrealDB queries from your running Surreal darabase. SurrealX extends the basic Surreal instance from the surrealdb package with `X` variants (e.g. `select` becomes `selectX`) that is aware of your active tables in your database.

Furthermore it provides a very basic migration setup. The SurrealDB team is working on a built-in migration tool, so our migration tool is only prelimenary.

## Example

Say you have the following migration file `migrations/1674939239403_initial.sql`, created with `surrealx migrate add initial`

```sql
-- Schemaless table
CREATE post SET title = "My first post";

-- Schemafull table
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD name ON TABLE user TYPE string;
DEFINE FIELD age ON TABLE user TYPE int;
```

And run the migration with `surrealx migrate run`, and afterwards generate the client lib with `surrealx generate --output src/gen.ts`. Then you will have a fully typechecked client lib that can do the following

```typescript
// SETUP
const db = new SurrealX('http://127.0.0.1:8000/rpc');
await db.signin({ user: 'root', pass: 'root' });
await db.use('test', 'test');

await db.selectAllX('user'); // type: {name: string, age: number}[]
await db.selectAllX('user:123'); // typeError
await db.selectX('user:123'); // type: {name: string, age: number}
await db.selectX('user'); // typeError
await db.selectX('post:123'); // type: Record<string, unknown>

// createX, changeX, modifyX, modifyAllX, deleteX, updateX

// You can always remove the `X` from the end of the method, which will use the built in Surreal method
```

## DISCLAIMER!

This package is still very much a work in progress.

Also, this is my first time using Deno rather than Node, so I would greatly appreciate any help with standard practices, setup and so on.

## Docs

- How to download

## TODO

- cases (i.e. snake_case, CamelCase, ...)
- path.join()
- Sample the database for when a table is schemaless
