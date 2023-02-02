import { printNode } from "ts-morph";
import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { createStringLiteralUnionTypeAlias } from "../createStringLiteralUnionTypeAlias.ts";

Deno.test("createTableType", () => {
  const type = createStringLiteralUnionTypeAlias("MyType", ["a", "b"], true);
  const node = printNode(type);
  assertEquals(
    node,
    `/**
 * Names of tables in the database
*/
export type MyType = "a" | "b";`,
  );
});
