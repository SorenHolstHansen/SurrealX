export const typeUtilsStatements = `
/** GENERAL UTIL TYPES */

interface DefaultGrammar {
	array: '*';
	prop: '.';
	omit: '!';
	mutate: '~';
	glob: '*';
}
interface PathGrammar {
	array: '*';
	prop: '.';
	omit: '';
	mutate: '';
	glob: '*';
}
interface SlashGrammar {
	array: '*';
	prop: '/';
	omit: '';
	mutate: '';
	glob: '';
}

/**
 * Gets the type of the prop at the path.
 *
 * @example
 * \`\`\`
 * type A = PropType<{name: {first: string, last: string}}, "/name/first"> // A = string
 * \`\`\`
 */
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
	[Path in DeepPickPath<T, SlashGrammar>]: {
		path: \`/\${Path}\`;
		value: PropType<T, Path>; // TODO: Partial or DeepPartial or not
	};
}[DeepPickPath<T, SlashGrammar>];

/** SURREALX VERSION OF SURREAL PATCH */
type AddPatchX<T extends Record<string, unknown>> = {
	op: 'add';
} & PathAndValue<T>;
type RemovePatchX<T extends Record<string, unknown>> = {
	op: 'remove';
	path: DeepPickPath<T, SlashGrammar>;
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

type WithId<T> = T & { id: string };

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
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
	): Promise<WithId<TableTypes[T]>[]> {
		return await super.select(thing);
	}

	/**
	 * Selects a specific record from the database.
	 *
	 * @param thing The record ID to select.
	 */
	async selectX<T extends TableName>(
		thing: \`\${T}:\${string}\`
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
	 * \`\`\`
	 * // Create an article with a random ID
	 * let article = await db.create('article');
	 * // Create an article with a specific ID
	 * let article = await db.create('article:h5wxrf2ewk8xjxosxtyc', {...});
	 * \`\`\`
	 */
	async createX<T extends TableName>(
		thing: T | \`\${T}:\${string}\`,
		data: TableTypes[T]
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
		data: TableTypes[T]
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
		thing: \`\${T}:\${string}\`,
		data: TableTypes[T]
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
		thing: T | \`\${T}:\${string}\`,
		data: DeepPartial<TableTypes[T]>
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
		data?: PatchX<TableTypes[T]>[] | undefined
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
		thing: \`\${T}:\${string}\`,
		data?: PatchX<TableTypes[T]>[] | undefined
	): Promise<PatchX<TableTypes[T]>[]> {
		return (await super.modify(thing, data as any)) as any;
	}
}`;
