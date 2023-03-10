export const typeUtilsStatements = `
type Join<K, P> = K extends string | number
	? P extends string | number
		? \`\${K}\${'' extends P ? '' : '/'}\${P}\`
		: never
	: never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Paths<T, D extends number = 5> = [D] extends [never]
	? never
	: T extends object
	? {
			[K in keyof T]-?: K extends string | number
				? \`\${K}\` | Join<K, Paths<T[K], Prev[D]>>
				: never;
	  }[keyof T]
	: '';

type PropType<T, Path extends string> = string extends Path
	? unknown
	: Path extends keyof T
	? T[Path]
	: Path extends \`\${infer K}/\${infer R}\`
	? K extends keyof T
		? PropType<T[K], R>
		: unknown
	: unknown;

type PathAndValue<T extends Record<string, unknown>> = {
	[Path in Paths<T>]: {
		path: \`/\${Path}\`;
		value: PropType<T, Path>; // TODO: Partial or DeepPartial or not
	};
}[Paths<T>];

/** SURREALX VERSION OF SURREAL PATCH */
type AddPatchX<T extends Record<string, unknown>> = {
	op: 'add';
} & PathAndValue<T>;
type RemovePatchX<T extends Record<string, unknown>> = {
	op: 'remove';
	path: Paths<T>;
};
type ReplacePatchX<T extends Record<string, unknown>> = {
	op: 'replace';
} & PathAndValue<T>;
type ChangePatchX<T extends Record<string, unknown>> = {
	op: 'change';
} & PathAndValue<T>;
type PatchX<T extends Record<string, unknown>> =
	| AddPatchX<T>
	| RemovePatchX<T>
	| ReplacePatchX<T>
	| ChangePatchX<T>;

export type Id<N extends string> = \`\${N}:\${string}\`;
export type WithId<T, N extends string> = T & { id: Id<N> };

type DeepPartial<T> = T extends object
	? { [P in keyof T]?: DeepPartial<T[P]> }
	: T;
`;

export const SurrealXClassStatements = `
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
		thing: T
	): Promise<WithId<TableTypes[T], T>[]> {
		return await super.select(thing);
	}

	/**
	 * Selects a specific record from the database.
	 *
	 * @param thing The record ID to select.
	 */
	async selectX<T extends TableName>(
		thing: Id<T>
	): Promise<WithId<TableTypes[T], T> | undefined> {
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
	 * \`\`\`
	 * // Create an article with a random ID
	 * let article = await db.create('article');
	 * // Create an article with a specific ID
	 * let article = await db.create('article:h5wxrf2ewk8xjxosxtyc', {...});
	 * \`\`\`
	 */
	async createX<T extends TableName>(
		thing: T | Id<T>,
		data: TableTypes[T]
	): Promise<WithId<TableTypes[T], T>> {
		return await super.create(thing, data) as any;
	}

	/**
	 * Updates all records in a table, or a specific record, in the database.
	 *
	 * NOTE: This function replaces the current document / record data with the specified data.
	 *
	 * @param thing ??? The table name or the specific record ID to update.
	 *
	 * @param data ??? The document / record data to insert.
	 */
	async updateAllX<T extends TableName>(
		thing: T,
		data: TableTypes[T]
	): Promise<WithId<TableTypes[T], T>[]> {
		return (await super.update(thing, data)) as any;
	}

	/**
	 * Updates all records in a table, or a specific record, in the database.
	 *
	 * NOTE: This function replaces the current document / record data with the specified data.
	 *
	 * @param thing ??? The table name or the specific record ID to update.
	 *
	 * @param data ??? The document / record data to insert.
	 */
	async updateX<T extends TableName>(
		thing: Id<T>,
		data: TableTypes[T]
	): Promise<WithId<TableTypes[T], T>> {
		return await super.update(thing, data) as any;
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
		thing: T | Id<T>,
		data: DeepPartial<TableTypes[T]>
	): Promise<WithId<TableTypes[T], T>> {
		return (await super.change(thing, data as any)) as any;
	}

	/**
	 * Deletes all records in a table, or a specific record, from the database.
	 *
	 * @param thing The table name or a record ID to select.
	 */
	async deleteAllX<T extends TableName>(thing: T): Promise<void> {
		return await super.delete(thing);
	}

	/**
	 * Deletes all records in a table, or a specific record, from the database.
	 *
	 * @param thing The table name or a record ID to select.
	 */
	async deleteX<T extends TableName>(thing: Id<T>): Promise<void> {
		return await super.delete(thing);
	}

	/**
	 * Applies JSON Patch changes to all records in the database.
	 *
	 * NOTE: This function patches the current document / record data with the specified JSON Patch data.
	 *
	 * @param thing ??? The table name to modify.
	 *
	 * @param data ??? The JSON Patch data with which to modify the records.
	 */
	async modifyAllX<T extends TableName>(
		thing: T,
		data?: PatchX<TableTypes[T]>[] | undefined
	): Promise<PatchX<TableTypes[T]>[][]> {
		return (await super.modify(thing, data as any)) as any;
	}

	/**
	 * Applies JSON Patch changes to a specific record in the database.
	 *
	 * NOTE: This function patches the current document / record data with the specified JSON Patch data.
	 *
	 * @param thing ??? The specific record ID to modify.
	 *
	 * @param data ??? The JSON Patch data with which to modify the records.
	 */
	async modifyX<T extends TableName>(
		thing: Id<T>,
		data?: PatchX<TableTypes[T]>[] | undefined
	): Promise<PatchX<TableTypes[T]>[]> {
		return (await super.modify(thing, data as any)) as any;
	}
}`;
