// ex. scripts/build_npm.ts
import { build, emptyDir } from 'https://deno.land/x/dnt/mod.ts';

await emptyDir('./npm');

await build({
	entryPoints: [
		{ kind: 'bin', name: 'surrealx', path: 'bin/mod.ts' },
		'./mod.ts',
	],
	outDir: './npm',
	shims: {
		// see JS docs for overview and more options
		deno: true,
	},
	mappings: {
		'https://deno.land/x/surrealdb@v0.5.0/mod.ts': {
			name: 'surrealdb.js',
			version: '^0.5.0',
		},
		'https://deno.land/x/ts_morph@17.0.1/mod.ts': {
			name: 'ts-morph',
			version: '^17.0.1',
		},
	},
	package: {
		// package.json properties
		name: 'surrealx',
		version: Deno.args[0]?.replace(/^v/, ''),
		description: 'A strongly typed SurrealDB client.',
		license: 'ISC',
		repository: {
			type: 'git',
			url: 'git+https://github.com/SorenHolstHansen/SurrealX.git',
		},
		bugs: {
			url: 'https://github.com/SorenHolstHansen/SurrealX/issues',
		},
	},
});

// post build steps
Deno.copyFileSync('LICENSE', 'npm/LICENSE');
Deno.copyFileSync('README.md', 'npm/README.md');
