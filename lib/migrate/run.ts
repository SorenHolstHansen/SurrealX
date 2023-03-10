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
  const migrationFiles = [...Deno.readDirSync("./migrations")].sort((a, b) => {
    const timestampA = parseInt(a.name.split("_")[0]);
    const timestampB = parseInt(b.name.split("_")[0]);
    return timestampA - timestampB;
  });
  try {
    for (const dirEntry of migrationFiles) {
      if (runMigrationFileNames.includes(dirEntry.name)) continue;
      console.log(`Running migration: ${dirEntry.name}`);
      const data = await Deno.readTextFile(`./migrations/${dirEntry.name}`);

      // TODO: Do this in a transaction
      await db.query(data);

      await db.create<Migration>(SurrealXMigrationTableName, {
        filename: dirEntry.name,
        appliedAt: Date.now(),
      });
    }
  } catch (e) {
    console.error("There was a problem running the migration file");
    console.error(e);
  } finally {
    db.close();
  }
}
