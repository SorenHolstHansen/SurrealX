import { ts } from "https://deno.land/x/ts_morph@17.0.1/mod.ts";
import { addComment } from "./addComment.ts";
const { factory } = ts;

function surrealTypeNameToTsTypeIdentifier(type: string): ts.TypeNode {
  const baseType = type.split("(")[0];
  switch (baseType) {
    case "string":
    case "datetime":
      return factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "int":
    case "decimal":
    case "float":
      return factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "bool":
      return factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "record":
      let table = type.match(/\((\w+)\)/)?.[1] ?? "unknown";
      return factory.createTypeReferenceNode(
        factory.createIdentifier("Id"),
        [factory.createLiteralTypeNode(factory.createStringLiteral(table))],
      );
    default:
      return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
}

type FieldInfo = { name: string; definition: string };

function getTypeFromDefinition(definition: string): string {
  const type = definition.match(/TYPE ([^\s]+)/)?.[1] ?? "string";
  return type;
}

/**
 * Creates the type alias for a table given the field info. The parentField should not be used directly
 */
export function createTableType(
  fieldInfo: FieldInfo[],
  /**
   * e.g. children of `name`, so fieldInfo would be fields like `name.first`, `name.last` and so on.
   * If undefined, this is the base layer
   */
  parentField?: string,
): ts.TypeNode {
  let baseFields: FieldInfo[] = [];
  if (parentField == null) {
    // base layer
    baseFields = fieldInfo.filter(
      (f) => !f.name.includes(".") && !f.name.includes("[*]"),
    );
  } else {
    baseFields = fieldInfo.filter(
      (f) => {
        const leaveName = f.name.replace(`${parentField}.`, "").replace(
          parentField,
          "",
        );
        return !leaveName.includes(".") && !/\w+\[\*\]$/.test(leaveName) &&
          !leaveName.startsWith("[*][*]");
      },
    );
  }

  if (baseFields.length === 1 && baseFields[0].name.endsWith("[*]")) {
    // parent is an array
    const { name, definition } = baseFields[0];
    const type = getTypeFromDefinition(definition);
    if (type === "object") {
      return createTableType(
        fieldInfo.filter((f) => f.name.startsWith(`${name}.`)),
        name,
      );
    } else if (type === "array") {
      return factory.createArrayTypeNode(
        createTableType(
          fieldInfo.filter((f) => f.name.startsWith(`${name}[*]`)),
          name,
        ),
      );
    } else {
      return surrealTypeNameToTsTypeIdentifier(type);
    }
  }

  const nodes = baseFields.map(({ name: _name, definition }) => {
    const name = _name.split(".").at(-1)!.replace("[*]", "");
    const type = getTypeFromDefinition(definition);
    const isOptional = !/ASSERT \$value != NONE/.test(definition);
    const questionMark = isOptional
      ? factory.createToken(ts.SyntaxKind.QuestionToken)
      : undefined;
    if (type === "object") {
      return addComment(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(name),
          questionMark,
          createTableType(
            fieldInfo.filter((f) => f.name.startsWith(`${_name}.`)),
            _name,
          ),
        ),
        "Definition:",
        "```sql",
        definition.replace("*/", "[REPLACED]"),
        "```",
      );
    } else if (type === "array") {
      return addComment(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(name),
          questionMark,
          factory.createArrayTypeNode(
            createTableType(
              fieldInfo.filter((f) => f.name.startsWith(`${_name}[*]`)),
              _name,
            ),
          ),
        ),
        "Definition:",
        "```sql",
        definition.replace("*/", "[REPLACED]"),
        "```",
      );
    } else {
      return addComment(
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(name),
          questionMark,
          surrealTypeNameToTsTypeIdentifier(type),
        ),
        "Definition:",
        "```sql",
        definition.replace("*/", "[REPLACED]"),
        "```",
      );
    }
  });
  // deno-lint-ignore no-explicit-any
  return factory.createTypeLiteralNode(nodes as any);
}
