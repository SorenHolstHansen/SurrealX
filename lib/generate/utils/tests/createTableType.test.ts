import { printNode } from "https://deno.land/x/ts_morph@17.0.1/mod.ts";
import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { createTableType } from "../createTableType.ts";

Deno.test("createTableType: can handle basic types", () => {
  const type = createTableType([
    {
      name: "age",
      definition: "DEFINE FIELD age ON user TYPE int ASSERT $value != NONE",
    },
    {
      name: "name",
      definition: "DEFINE FIELD name ON user TYPE string",
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
     * DEFINE FIELD name ON user TYPE string
     * \`\`\`
    */
    name?: string;
}`,
  );
});

Deno.test("createTableType: can handle objects", () => {
  const type = createTableType([
    { name: "name", definition: "DEFINE FIELD name ON user TYPE object" },
    {
      name: "name.first",
      definition:
        "DEFINE FIELD name.first ON user TYPE string ASSERT $value != NONE",
    },
    {
      name: "name.last",
      definition: "DEFINE FIELD name.last ON user TYPE string",
    },
  ]);
  const node = printNode(type);
  assertEquals(
    node,
    `{
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
}`,
  );
});

Deno.test({
  name: "createTableType: can handle arrays of primitives",
  fn: () => {
    const type = createTableType([
      {
        name: "comments",
        definition:
          "DEFINE FIELD comments ON user TYPE array ASSERT $value != NONE",
      },
      {
        name: "comments[*]",
        definition:
          "DEFINE FIELD comments[*] ON user TYPE string ASSERT $value != NONE",
      },
    ]);
    const node = printNode(type);
    assertEquals(
      node,
      `{
    /**
     * Definition:
     * \`\`\`sql
     * DEFINE FIELD comments ON user TYPE array ASSERT $value != NONE
     * \`\`\`
    */
    comments: string[];
}`,
    );
  },
});

Deno.test({
  name: "createTableType: can handle arrays of objects",
  fn: () => {
    const type = createTableType([
      {
        name: "comments",
        definition:
          "DEFINE FIELD comments ON user TYPE array ASSERT $value != NONE",
      },
      {
        name: "comments[*]",
        definition:
          "DEFINE FIELD comments[*] ON user TYPE object ASSERT $value != NONE",
      },
      {
        name: "comments[*].id",
        definition:
          "DEFINE FIELD comments[*].id ON user TYPE string ASSERT $value = /^comment:.*/",
      },
      {
        name: "comments[*].title",
        definition: "DEFINE FIELD comments[*].title ON user TYPE string",
      },
    ]);
    const node = printNode(type);
    assertEquals(
      node,
      `{
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
}`,
    );
  },
});

Deno.test({
  name: "createTableType: can handle matrices",
  fn: () => {
    const type = createTableType([
      {
        name: "matrix",
        definition:
          "DEFINE FIELD matrix ON user TYPE array ASSERT $value != NONE",
      },
      {
        name: "matrix[*]",
        definition:
          "DEFINE FIELD matrix[*] ON user TYPE array ASSERT $value != NONE",
      },
      {
        name: "matrix[*][*]",
        definition:
          "DEFINE FIELD matrix[*][*] ON user TYPE int ASSERT $value != NONE",
      },
    ]);
    const node = printNode(type);
    assertEquals(
      node,
      `{
    /**
     * Definition:
     * \`\`\`sql
     * DEFINE FIELD matrix ON user TYPE array ASSERT $value != NONE
     * \`\`\`
    */
    matrix: number[][];
}`,
    );
  },
});

Deno.test({
  name: "createTableType: can handle deeply nested arrays and objects",
  fn: () => {
    const type = createTableType([
      {
        name: "nested",
        definition: "DEFINE FIELD nested ON user TYPE array",
      },
      {
        name: "nested[*]",
        definition: "DEFINE FIELD nested[*] ON user TYPE object",
      },
      {
        name: "nested[*].num",
        definition: "DEFINE FIELD nested[*].num ON user TYPE int",
      },
      {
        name: "nested[*].positions",
        definition: "DEFINE FIELD nested[*].positions ON user TYPE array",
      },
      {
        name: "nested[*].positions[*]",
        definition: "DEFINE FIELD nested[*].positions[*] ON user TYPE object",
      },
      {
        name: "nested[*].positions[*].row",
        definition: "DEFINE FIELD nested[*].positions[*].row ON user TYPE int",
      },
      {
        name: "nested[*].positions[*].column",
        definition:
          "DEFINE FIELD nested[*].positions[*].column ON user TYPE int",
      },
    ]);
    const node = printNode(type);
    assertEquals(
      node,
      `{
    /**
     * Definition:
     * \`\`\`sql
     * DEFINE FIELD nested ON user TYPE array
     * \`\`\`
    */
    nested?: {
        /**
         * Definition:
         * \`\`\`sql
         * DEFINE FIELD nested[*].num ON user TYPE int
         * \`\`\`
        */
        num?: number;
        /**
         * Definition:
         * \`\`\`sql
         * DEFINE FIELD nested[*].positions ON user TYPE array
         * \`\`\`
        */
        positions?: {
            /**
             * Definition:
             * \`\`\`sql
             * DEFINE FIELD nested[*].positions[*].row ON user TYPE int
             * \`\`\`
            */
            row?: number;
            /**
             * Definition:
             * \`\`\`sql
             * DEFINE FIELD nested[*].positions[*].column ON user TYPE int
             * \`\`\`
            */
            column?: number;
        }[];
    }[];
}`,
    );
  },
});
