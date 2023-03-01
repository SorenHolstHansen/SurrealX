import Surreal from "https://deno.land/x/surrealdb@v0.5.0/mod.ts";

type Migration = {
  filename: string;
  appliedAt: number; // timestamp
};

export const SurrealXMigrationTableName = "_surrealx_migrations";

export async function runMigrations(db: Surreal): Promise<void> {
  // Find all the migrations that has been run
  const runMigrations = await db.select<Migration>(SurrealXMigrationTableName);
  const runMigrationFileNames = runMigrations.map(({ filename }) => filename);
  for await (const dirEntry of Deno.readDir("./migrations")) {
    if (runMigrationFileNames.includes(dirEntry.name)) continue;
    console.log(`Running migration: ${dirEntry.name}`);
    const data = await Deno.readTextFile(`./migrations/${dirEntry.name}`);
    let lines = data
      .split("\n")
      .filter((line) => !line.startsWith("--") && line.length !== 0);

    lines = lines.reduce((accumulator, currentValue) => {
      if (currentValue.trim().startsWith("--")) return accumulator;
      if (
        accumulator.length === 0 ||
        accumulator[accumulator.length - 1].endsWith(";")
      ) {
        return [...accumulator, currentValue];
      }
      const lastValue = accumulator.pop();
      return [...accumulator, lastValue + "\n" + currentValue];
    }, [] as string[]);

    try {
      // TODO: Do this in a transaction
      await Promise.all(
        lines.map(async (line) => {
          await db.query(line);
        }),
      );

      await db.create<Migration>(SurrealXMigrationTableName, {
        filename: dirEntry.name,
        appliedAt: Date.now(),
      });
    } catch (e) {
      console.error("There was a problem running the migration file");
      console.error(e);
      console.log("Ran lines", lines);
    } finally {
      db.close();
    }
  }
}
