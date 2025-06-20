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
