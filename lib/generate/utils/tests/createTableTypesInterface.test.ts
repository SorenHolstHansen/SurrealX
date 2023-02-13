import { printNode } from "https://deno.land/x/ts_morph@17.0.1/mod.ts";
import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { createTableTypesInterface } from "../createTableTypesInterface.ts";

Deno.test("createTableType", () => {
  const type = createTableTypesInterface(["tableA", "myTable"]);
  const node = printNode(type);
  assertEquals(
    node,
    `interface TableTypes extends Record<TableName, Record<string, unknown>> {
    tableA: TableA;
    myTable: MyTable;
}`,
  );
});
