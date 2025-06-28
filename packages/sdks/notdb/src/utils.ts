import { JSONSchema } from "./types";

export function getRequiredFields(schema: JSONSchema): string[] {
  return Object.entries(schema.properties ?? {})
    .filter(([_, config]) => config.required)
    .map(([key]) => key);
}

export function getUniqueFields(schema: JSONSchema): string[] {
  return Object.entries(schema.properties ?? {})
    .filter(([_, config]) => config.unique)
    .map(([key]) => key);
}

export function applyDefaultValues(
  schema: JSONSchema,
  data: Record<string, any>
): Record<string, any> {
  const result = { ...data };

  for (const key in schema.properties) {
    const field = schema.properties[key];
    const hasValue = typeof result[key] !== "undefined";

    if (!hasValue && typeof field.default !== "undefined") {
      result[key] =
        typeof field.default === "function" ? field.default() : field.default;
    }
  }

  return result;
}
