# SurrealX

A strongly typed SurrealDB client.

SurrealX is a CLI and library that generates a strongly typed client for SurrealDB queries
from your running Surreal database. SurrealX extends the basic Surreal instance
from the surrealdb package with `X` variants (e.g. `select` becomes `selectX`)
that is aware of your active tables in your database.

Furthermore it provides a very basic migration setup. The SurrealDB team is
working on a built-in migration tool, so our migration tool is only prelimenary, and should probably not be used in production.

## Example

Say you have made the following queries to your Surreal database (possible
created with our migration tool)

```sql
-- Schemaless table
CREATE post SET title = "My first post";

-- Schemafull table
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD age ON TABLE user TYPE int ASSERT $value != NONE;
DEFINE FIELD name ON TABLE user TYPE object;
DEFINE FIELD name.first ON TABLE user TYPE string ASSERT $value != NONE;
DEFINE FIELD name.last ON TABLE user TYPE string;
DEFINE FIELD comments ON TABLE user TYPE array;
DEFINE FIELD comments.* ON TABLE user TYPE object ASSERT $value != NONE;
DEFINE FIELD comments.*.id ON TABLE user TYPE string ASSERT $value = /^comment:.*/;
DEFINE FIELD comments.*.title ON TABLE user TYPE string;
```

And then generate the client lib with `surrealx generate --output gen.ts`.
Then you will have a fully typechecked client lib that can do the following, where the tablenames table records, update statements and so on are type checked.

```typescript
// gen.ts
import { Post, SurrealX, User } from './gen.ts';

/**
 * type Post = Record<string, unknown>;
 *
 * type User = {
 *  age: number;
 *  comments?: {
 *      id?: string;
 *      title?: string;
 *  }[];
 *  name?: {
 *      first: string;
 *      last?: string;
 *  };
 * };
 */

// SETUP
const db = new SurrealX('http://127.0.0.1:8000/rpc');
await db.signin({ user: 'root', pass: 'root' });
await db.use('test', 'test');

// selectX and selectAllX
await db.selectAllX('user'); // type: User[]
await db.selectAllX('user:123'); // typeError
await db.selectAllX('user:123', ['name.first', 'age', 'id']); // type: { age: number, name?: { first: string } }[]
await db.selectX('user:123'); // type: User | undefined
await db.selectX('user'); // typeError
await db.selectX('post:123'); // type: Record<string, unknown>

// createX, with type checked data insert
await db.createX('user', { age: 20, name: { first: 'Ben' } }); // type: User

// updateX and updateAllX, with type checked data insert
await db.updateX('user:123', { age: 20, name: { first: 'Ben' } }); // type: User
await db.updateAllX('user', { age: 20, name: { first: 'Ben' } }); // type: User[]

// changeX and changeAllX, with type checked data insert (there are deep partial)
await db.changeX('user:123', { name: { first: 'Ben' } }); // type: User
await db.changeAllX('user', { name: { first: 'Ben' } }); // type: User[]

// deleteX, with type checked table name, like the others
await db.deleteX('user:123'); // type; void

// modifyX, modifyAllX
await db.modifyX('user:123', [{ op: 'replace', path: '/age', value: 20 }]);

// You can always remove the `X` from the end of the method, which will use the built in Surreal method
```

## Docs

You can either use surrealX as a CLI or a library. The usage is very similar for both, so these docs show the CLI usage:

You can see how to use the CLI by running

```
deno run https://deno.land/x/surrealx/bin/mod.ts --help
```

Which will yield the following

```
surrealx <cmd> [options]

Commands:
  surrealx migrate <subcommand>  Group of commands for creating and running migr
                                 ations
  surrealx generate              Generate a SurrealDB client from the database
  surrealx database              Group of commands for interacting with the data
                                 base

Options:
      --version           Show version number                          [boolean]
      --url               The url with which to connect with SurrealDB
                                 [string] [default: "http://127.0.0.1:8000/rpc"]
      --token             The token with which to connect with SurrealDB[string]
  -u, --user                                          [string] [default: "root"]
  -p, --pass, --password                              [string] [default: "root"]
      --ns, --namespace                               [string] [default: "test"]
      --db, --database                                [string] [default: "test"]
      --help              Show help                                    [boolean]
```

From there you can either add migrations with `migrate add <description>`, run pending migrations with `migrate run` or generate the surrealX client with `generate --output <output.file>`.

### Migrations

To add a new migration file run

```
surrealx migrate add <description>
```

which will create a migration file with the name `<timestamp>_<description>.sql` (e.g. `20230206192324_initial_migration.sql`). You can then write whatever SurrealDB statements you want. However because of the current implementation you HAVE TO END ALL YOUR STATEMENTS WITH SEMICOLONS;

We are working on making the migrations implementation better.

After you have written all your statements, you can run any pending migrations with

```
surrealx migrate run
```

## FAQ

- Q: What does the `[REPLACED]` thing mean in the comments.
- A: Sometimes you might have defined a file like this
  `DEFINE FIELD comment ON TABLE post TYPE string ASSERT $value = /^comment:.*/;`,
  or similar. The issue is that this includes the string `*/` which is the same
  as the closing tag of the ts doc comment. There are currently
  [no workaround for this](https://github.com/microsoft/tsdoc/issues/166), so
  hence the `[REPLACED]`.
