import * as surrealX from "../mod.ts";
import yargs from "https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts";
import { withDB } from "./withDB.ts";

type Arguments = {
  url: string;
  token?: string;
  user: string;
  pass: string;
  ns: string;
  db: string;
};

type GenerateArguments = Arguments & {
  output: string;
};

type MigrateAddArguments = Arguments & {
  description: string;
};

yargs(Deno.args)
  .scriptName("surrealx")
  .usage("$0 <cmd> [options]")
  .command(
    "migrate <subcommand>",
    "Group of commands for creating and running migrations",
    (yargs: any) => {
      yargs
        .command(
          "run",
          "Run all pending migrations",
          {},
          async (argv: Arguments) => {
            await withDB(argv, async (db) => await surrealX.runMigrations(db));
          },
        )
        .command(
          "add [description]",
          "Create a new migration with the given description, and the current time as the version",
          {},
          (argv: MigrateAddArguments) => {
            if (argv.description == null) {
              throw new Error("Missing parameter: description");
            }
            surrealX.addMigration(argv.description);
          },
        )
        .help();
    },
  )
  .command(
    "generate",
    "Generate a SurrealDB client from the database",
    (yargs: any) => {
      return yargs.positional("output", {
        alias: "o",
        type: "string",
        description: "The location of the outputted file, e.g. src/gen.ts",
      });
    },
    async (argv: GenerateArguments) => {
      console.log("Generating SurrealDB client");
      await withDB(
        argv,
        async (db) => await surrealX.generate(db, argv.output),
      );
    },
  )
  .command(
    "database",
    "Group of commands for interacting with the database",
    (yargs: any) => {
      yargs
        .command("reset", "reset the database", {}, async (argv: Arguments) => {
          await withDB(argv, async (db) => {
            await db.query(`REMOVE DATABASE ${argv.db}`);
            await db.query(`DEFINE DATABASE ${argv.db}`);
          });
        })
        .help();
    },
  )
  .option("url", {
    type: "string",
    description: "The url with which to connect with SurrealDB",
    default: "http://127.0.0.1:8000/rpc",
  })
  .option("token", {
    type: "string",
    description: "The token with which to connect with SurrealDB",
    default: undefined,
  })
  .option("user", {
    alias: "u",
    type: "string",
    default: "root",
  })
  .option("pass", {
    alias: ["password", "p"],
    type: "string",
    default: "root",
  })
  .option("ns", {
    alias: "namespace",
    type: "string",
    default: "test",
  })
  .option("db", {
    alias: "database",
    type: "string",
    default: "test",
  })
  .help().argv;
