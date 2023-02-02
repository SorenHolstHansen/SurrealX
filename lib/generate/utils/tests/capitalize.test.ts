import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { capitalize } from "../capitalize.ts";

Deno.test("createTableType", () => {
  assertEquals(capitalize("hello, World!"), `Hello, World!`);
});
