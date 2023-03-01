import Surreal from "https://deno.land/x/surrealdb@v0.5.0/mod.ts";

type Join<K, P> = K extends string | number
  ? P extends string | number ? `${K}${"" extends P ? "" : "/"}${P}`
  : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Paths<T, D extends number = 5> = [D] extends [never] ? never
  : T extends object ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : "";

type PropType<T, Path extends string> = string extends Path ? unknown
  : Path extends keyof T ? T[Path]
  : Path extends `${infer K}/${infer R}` ? K extends keyof T ? PropType<T[K], R>
    : unknown
  : unknown;

type PathAndValue<T extends Record<string, unknown>> = {
  [Path in Paths<T>]: {
    path: `/${Path}`;
    value: PropType<T, Path>; // TODO: Partial or DeepPartial or not
  };
}[Paths<T>];

/** SURREALX VERSION OF SURREAL PATCH */
type AddPatchX<T extends Record<string, unknown>> = {
  op: "add";
} & PathAndValue<T>;
type RemovePatchX<T extends Record<string, unknown>> = {
  op: "remove";
  path: Paths<T>;
};
type ReplacePatchX<T extends Record<string, unknown>> = {
  op: "replace";
} & PathAndValue<T>;
type ChangePatchX<T extends Record<string, unknown>> = {
  op: "change";
} & PathAndValue<T>;
type PatchX<T extends Record<string, unknown>> =
  | AddPatchX<T>
  | RemovePatchX<T>
  | ReplacePatchX<T>
  | ChangePatchX<T>;

type WithId<T> = T & { id: string };

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
/**
 * Definition:
 * ```sql
 * DEFINE TABLE article SCHEMAFULL
 * ```
 */
export type Article = {
  /**
   * Definition:
   * ```sql
   * DEFINE FIELD optional ON article TYPE string
   * ```
   */
  optional?: string;
  /**
   * Definition:
   * ```sql
   * DEFINE FIELD required ON article TYPE string ASSERT $value != NONE
   * ```
   */
  required: string;
};
/**
 * Definition:
 * ```sql
 * DEFINE TABLE post SCHEMALESS
 * ```
 */
export type Post = Record<string, unknown>;
/**
 * Definition:
 * ```sql
 * DEFINE TABLE user SCHEMAFULL
 * ```
 */
export type User = {
  /**
   * Definition:
   * ```sql
   * DEFINE FIELD age ON user TYPE int ASSERT $value != NONE
   * ```
   */
  age: number;
  /**
   * Definition:
   * ```sql
   * DEFINE FIELD comments ON user TYPE array
   * ```
   */
  comments?: {
    /**
     * Definition:
     * ```sql
     * DEFINE FIELD comments[*].id ON user TYPE string ASSERT $value = /^comment:.[REPLACED]
     * ```
     */
    id?: string;
    /**
     * Definition:
     * ```sql
     * DEFINE FIELD comments[*].title ON user TYPE string
     * ```
     */
    title?: string;
  }[];
  /**
   * Definition:
   * ```sql
   * DEFINE FIELD name ON user TYPE object
   * ```
   */
  name?: {
    /**
     * Definition:
     * ```sql
     * DEFINE FIELD name.first ON user TYPE string ASSERT $value != NONE
     * ```
     */
    first: string;
    /**
     * Definition:
     * ```sql
     * DEFINE FIELD name.last ON user TYPE string
     * ```
     */
    last?: string;
  };
};
/**
 * Names of tables in the database
 */
export type TableName = "article" | "post" | "user";
interface TableTypes extends Record<TableName, Record<string, unknown>> {
  article: Article;
  post: Post;
  user: User;
}

export class SurrealX extends Surreal {
  /**
   * Initializee a SurrealDb.
   *
   * @param url The url of the database endpoint to connect to.
   *
   * @param token The authorization token.
   */
  constructor(url?: string | undefined, token?: string | undefined) {
    super(url, token);
  }

  /**
   * Selects all records in a table from the database.
   *
   * @param thing The table name to select.
   */
  async selectAllX<T extends TableName>(
    thing: T,
  ): Promise<WithId<TableTypes[T]>[]> {
    return await super.select(thing);
  }

  /**
   * Selects a specific record from the database.
   *
   * @param thing The record ID to select.
   */
  async selectX<T extends TableName>(
    thing: `${T}:${string}`,
  ): Promise<WithId<TableTypes[T]> | undefined> {
    const result = await super.select(thing);
    return result[0] as any;
  }

  /**
   * Creates a record in the database.
   *
   * @param thing The table name or the specific record ID to create.
   *
   * @param data The document / record data to insert.
   *
   * @example
   * ```
   * // Create an article with a random ID
   * let article = await db.create('article');
   * // Create an article with a specific ID
   * let article = await db.create('article:h5wxrf2ewk8xjxosxtyc', {...});
   * ```
   */
  async createX<T extends TableName>(
    thing: T | `${T}:${string}`,
    data: TableTypes[T],
  ): Promise<WithId<TableTypes[T]>> {
    return await super.create(thing, data);
  }

  /**
   * Updates all records in a table, or a specific record, in the database.
   *
   * NOTE: This function replaces the current document / record data with the specified data.
   *
   * @param thing — The table name or the specific record ID to update.
   *
   * @param data — The document / record data to insert.
   */
  async updateAllX<T extends TableName>(
    thing: T,
    data: TableTypes[T],
  ): Promise<WithId<TableTypes[T]>[]> {
    return (await super.update(thing, data)) as any;
  }

  /**
   * Updates all records in a table, or a specific record, in the database.
   *
   * NOTE: This function replaces the current document / record data with the specified data.
   *
   * @param thing — The table name or the specific record ID to update.
   *
   * @param data — The document / record data to insert.
   */
  async updateX<T extends TableName>(
    thing: `${T}:${string}`,
    data: TableTypes[T],
  ): Promise<WithId<TableTypes[T]>> {
    return await super.update(thing, data);
  }

  /**
   * Modifies all records in a table, or a specific record, in the database.
   *
   * NOTE: This function merges the current document / record data with the specified data.
   *
   * @param thing The table name or the specific record ID to change.
   *
   * @param data The document / record data to insert.
   */
  async changeX<T extends TableName>(
    thing: T | `${T}:${string}`,
    data: DeepPartial<TableTypes[T]>,
  ): Promise<WithId<TableTypes[T]>> {
    return (await super.change(thing, data)) as any;
  }

  /**
   * Deletes all records in a table, or a specific record, from the database.
   *
   * @param thing The table name or a record ID to select.
   */
  async deleteX<T extends TableName>(thing: T): Promise<void> {
    return await super.delete(thing);
  }

  /**
   * Applies JSON Patch changes to all records in the database.
   *
   * NOTE: This function patches the current document / record data with the specified JSON Patch data.
   *
   * @param thing — The table name to modify.
   *
   * @param data — The JSON Patch data with which to modify the records.
   */
  async modifyAllX<T extends TableName>(
    thing: T,
    data?: PatchX<TableTypes[T]>[] | undefined,
  ): Promise<PatchX<TableTypes[T]>[][]> {
    return (await super.modify(thing, data as any)) as any;
  }

  /**
   * Applies JSON Patch changes to a specific record in the database.
   *
   * NOTE: This function patches the current document / record data with the specified JSON Patch data.
   *
   * @param thing — The specific record ID to modify.
   *
   * @param data — The JSON Patch data with which to modify the records.
   */
  async modifyX<T extends TableName>(
    thing: `${T}:${string}`,
    data?: PatchX<TableTypes[T]>[] | undefined,
  ): Promise<PatchX<TableTypes[T]>[]> {
    return (await super.modify(thing, data as any)) as any;
  }
}
