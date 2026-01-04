export type SchemaDefinition = Record<
  string,
  { type: string; required?: boolean }
>;

export function validateAgainstSchema(
  data: Record<string, unknown>,
  schema: SchemaDefinition,
): { valid: boolean; error?: string } {
  for (const [field, definition] of Object.entries(schema)) {
    const value = data[field];
    const expectedType = definition.type;
    const isRequired = definition.required ?? false;

    if (value === undefined || value === null) {
      if (isRequired) {
        return { valid: false, error: `Field '${field}' is required` };
      }
      continue;
    }

    const actualType = typeof value;

    if (expectedType === "array" && !Array.isArray(value)) {
      return { valid: false, error: `Field '${field}' should be an array` };
    }

    if (expectedType !== "array" && actualType !== expectedType) {
      return {
        valid: false,
        error: `Field '${field}' should be of type ${expectedType}, got ${actualType}`,
      };
    }
  }

  return { valid: true };
}
