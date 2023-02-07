import { printNode } from 'https://deno.land/x/ts_morph@17.0.1/mod.ts';
import { assertEquals } from 'https://deno.land/std@0.174.0/testing/asserts.ts';
import { createTableType } from '../createTableType.ts';

Deno.test('createTableType', () => {
	const type = createTableType([
		{
			name: 'age',
			definition: 'DEFINE FIELD age ON user TYPE int ASSERT $value != NONE',
		},
		{
			name: 'comments',
			definition:
				'DEFINE FIELD comments ON user TYPE array ASSERT $value != NONE',
		},
		{
			name: 'comments[*]',
			definition:
				'DEFINE FIELD comments[*] ON user TYPE object ASSERT $value != NONE',
		},
		{
			name: 'comments[*].id',
			definition:
				'DEFINE FIELD comments[*].id ON user TYPE string ASSERT $value = /^comment:.*/',
		},
		{
			name: 'comments[*].title',
			definition: 'DEFINE FIELD comments[*].title ON user TYPE string',
		},
		{ name: 'name', definition: 'DEFINE FIELD name ON user TYPE object' },
		{
			name: 'name.first',
			definition:
				'DEFINE FIELD name.first ON user TYPE string ASSERT $value != NONE',
		},
		{
			name: 'name.last',
			definition: 'DEFINE FIELD name.last ON user TYPE string',
		},
	]);
	const node = printNode(type);
	assertEquals(
		node,
		`{
    /**
     * Definition:
     * \`\`\`sql
     * DEFINE FIELD age ON user TYPE int ASSERT $value != NONE
     * \`\`\`
    */
    age: number;
    /**
     * Definition:
     * \`\`\`sql
     * DEFINE FIELD comments ON user TYPE array ASSERT $value != NONE
     * \`\`\`
    */
    comments: {
        /**
         * Definition:
         * \`\`\`sql
         * DEFINE FIELD comments[*].id ON user TYPE string ASSERT $value = /^comment:.[REPLACED]
         * \`\`\`
        */
        id?: string;
        /**
         * Definition:
         * \`\`\`sql
         * DEFINE FIELD comments[*].title ON user TYPE string
         * \`\`\`
        */
        title?: string;
    }[];
    /**
     * Definition:
     * \`\`\`sql
     * DEFINE FIELD name ON user TYPE object
     * \`\`\`
    */
    name?: {
        /**
         * Definition:
         * \`\`\`sql
         * DEFINE FIELD name.first ON user TYPE string ASSERT $value != NONE
         * \`\`\`
        */
        first: string;
        /**
         * Definition:
         * \`\`\`sql
         * DEFINE FIELD name.last ON user TYPE string
         * \`\`\`
        */
        last?: string;
    };
}`
	);
});
