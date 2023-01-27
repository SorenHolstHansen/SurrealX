import Surreal from 'https://deno.land/x/surrealdb/mod.ts';
import { PatchX } from './typeUtils.ts';

type Table = 'article' | 'post' | 'person';
type Article = {
	title: string;
};
type Person = {
	title: string;
	name: {
		first: string;
		last: string;
	};
	marketing: boolean;
	identifier: string;
};

type Post = Record<string, unknown>;

type WithId<T> = T & { id: string };

interface TableTypes extends Record<Table, Record<string, unknown>> {
	article: Article;
	person: Person;
	post: Post;
}

/**
 * TODO:
 * - inline types
 * - undefined vs null
 */
export class SurrealX extends Surreal {
	constructor(url?: string | undefined, token?: string | undefined) {
		super(url, token);
	}

	/**
	 * Selects all records in a table from the database.
	 *
	 * @param thing The table name to select.
	 */
	async selectAllX<T extends Table>(
		thing: T
	): Promise<WithId<TableTypes[T]>[]> {
		return await super.select(thing);
	}

	/**
	 * Selects a specific record from the database.
	 *
	 * @param thing The record ID to select.
	 */
	async selectX<T extends Table>(
		thing: `${T}:${string}`
	): Promise<WithId<TableTypes[T]>> {
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
	async createX<T extends Table>(
		thing: T | `${T}:${string}`,
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
	async updateX<T extends Table>(
		thing: T | `${T}:${string}`,
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
	async changeX<T extends Table>(
		thing: T | `${T}:${string}`,
		data: Partial<TableTypes[T]> // TODO: DeepPartial here?
	): Promise<WithId<TableTypes[T]>> {
		return (await super.change(thing, data)) as any;
	}

	/**
	 * Deletes all records in a table, or a specific record, from the database.
	 *
	 * @param thing The table name or a record ID to select.
	 */
	async deleteX<T extends Table>(thing: T): Promise<void> {
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
	async modifyAllX<T extends Table>(
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
	async modifyX<T extends Table>(
		thing: `${T}:${string}`,
		data?: PatchX<TableTypes[T]>[] | undefined
	): Promise<PatchX<TableTypes[T]>[]> {
		return (await super.modify(thing, data as any)) as any;
	}

	// TODO: query()
	// TODO: selectX(thing, fieldsToGet!)
}
