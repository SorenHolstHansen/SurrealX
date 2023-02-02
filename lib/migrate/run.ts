import Surreal from "surrealdb";

export async function runMigrations(db: Surreal): Promise<void> {
  for await (const dirEntry of Deno.readDir("./migrations")) {
    console.log(dirEntry.name);
    const data = await Deno.readTextFile(`./migrations/${dirEntry.name}`);
    try {
      const lines = data.split("\n");
      await Promise.all(
        lines
          .filter((line) => !line.startsWith("--") && line.length !== 0)
          .map(async (line) => {
            console.log({ line });
            const res = await db.query(line);
            console.log({ res: res[0].result });
          }),
      );
    } catch (e) {
      console.log({ e });
    }
  }
}
