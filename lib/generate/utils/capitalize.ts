import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';

export function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

Deno.test('createTableType', () => {
	assertEquals(capitalize('hello, World!'), `Hello, World!`);
});
