export type FieldType = "string" | "number" | "boolean";

export type JSONSchema = {
  properties: {
    [key: string]: {
      type: FieldType;
      required?: boolean;
      unique?: boolean;
      default?: any;
    };
  };
};

export type SchemaDefinition = {
  [collection: string]: JSONSchema;
};

type InferFieldType<T extends FieldType> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : never;

export type InferSchemaProps<T extends JSONSchema["properties"]> = {
  [K in keyof T as T[K]["required"] extends true ? K : never]: InferFieldType<
    T[K]["type"]
  >;
} & {
  [K in keyof T as T[K]["required"] extends true ? never : K]?: InferFieldType<
    T[K]["type"]
  >;
};

export interface CreateClientOptions {
  apiKey: string;
}
