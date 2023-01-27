/**
 * Gets the type of the prop at the path.
 *
 * @example
 * ```
 * type A = PropType<{name: {first: string, last: string}}, "/name/first"> // A = string
 * ```
 */
export type PropType<T, Path extends string> = string extends Path
	? unknown
	: Path extends keyof T
	? T[Path]
	: Path extends `${infer K}/${infer R}`
	? K extends keyof T
		? PropType<T[K], R>
		: unknown
	: unknown;

type Prev = [
	never,
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20,
	...0[]
];

type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${'' extends P ? '' : '/'}${P}`
		: never
	: never;

/**
 * The paths of an object.
 *
 * @example
 * ```
 * type P = Paths<{id: string, name: {first: string}}> // "/id" | "/name" | "/name/first"
 * ```
 */
export type Paths<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? {
			[K in keyof T]-?: K extends string | number
				? `${K}` | Join<K, Paths<T[K], Prev[D]>>
				: never;
	  }[keyof T]
	: '';

/**
 * The leaves of an object.
 *
 * @example
 * ```
 * type P = Paths<{id: string, name: {first: string}}> // "/id" | "/name/first"
 * ```
 */
export type Leaves<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
	: '';

type PathAndValue<T extends Record<string, unknown>> = {
	[Path in Paths<T>]: {
		path: `/${Path}`;
		value: PropType<T, Path>; // TODO: Partial or DeepPartial or not
	};
}[Paths<T>];

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
export type PatchX<T extends Record<string, unknown>> =
	| AddPatchX<T>
	| RemovePatchX<T>
	| ReplacePatchX<T>
	| ChangePatchX<T>;
