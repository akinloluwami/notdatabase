export function validateAgainstSchema(
  data: Record<string, any>,
  schema: Record<string, string>
): string | null {
  for (const [field, expectedType] of Object.entries(schema)) {
    const value = data[field];

    if (value === undefined) continue;

    const actualType = typeof value;

    if (expectedType === "array" && !Array.isArray(value)) {
      return `Field '${field}' should be an array`;
    }

    if (expectedType !== "array" && actualType !== expectedType) {
      return `Field '${field}' should be of type ${expectedType}, got ${actualType}`;
    }
  }

  return null;
}
