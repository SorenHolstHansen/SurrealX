import Surreal, { Result } from "https://deno.land/x/surrealdb@v0.5.0/mod.ts";

type DBInfo = {
  dl: Record<string, unknown>;
  dt: Record<string, unknown>;
  sc: Record<string, unknown>;
  tb: Record<string, string>;
};
export async function infoForDb(db: Surreal): Promise<DBInfo | undefined> {
  const info = await db.query<Result<DBInfo>[]>("INFO FOR db;");
  return info[0].result;
}

type TableInfo = {
  ev: Record<string, unknown>;
  fd: Record<string, string>;
  ft: Record<string, unknown>;
  ix: Record<string, unknown>;
};

export async function infoForTable(
  db: Surreal,
  tableName: string,
): Promise<TableInfo | undefined> {
  const info = await db.query<Result<TableInfo>[]>(
    `INFO FOR TABLE ${tableName};`,
  );
  return info[0].result;
}
