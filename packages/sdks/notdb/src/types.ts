type SystemFields = {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type JSONFieldType = "string" | "number" | "boolean";

export type JSONSchema = {
  properties: {
    [key: string]: {
      type: JSONFieldType;
      required?: boolean;
      unique?: boolean;
      default?: any;
    };
  };
};

export type SchemaDefinition = {
  [collection: string]: JSONSchema;
};

export interface CreateClientOptions {
  apiKey: string;
}

export type SelectFields<T> = {
  [K in keyof T]?: true;
};

export type InferFieldType<T extends { type: JSONFieldType }> =
  T["type"] extends "string"
    ? string
    : T["type"] extends "number"
      ? number
      : T["type"] extends "boolean"
        ? boolean
        : never;

export type InferSchemaProps<T extends JSONSchema["properties"]> = {
  [K in keyof T]: InferFieldType<T[K]>;
} & SystemFields;

export type InsertSchemaProps<T extends JSONSchema["properties"]> =
  InferSchemaProps<T> & { key?: string };

export type InferSelected<T, S extends SelectFields<T> | undefined> =
  S extends SelectFields<T>
    ? {
        [K in keyof S & keyof T]: S[K] extends true ? T[K] : never;
      } & {
        _id: string;
        createdAt: string;
        updatedAt: string;
      }
    : T & {
        _id: string;
        createdAt: string;
        updatedAt: string;
      };

// Helper type for increment/decrement
export type IncrementDecrement = { increment: number } | { decrement: number };

// For update: allow number | IncrementDecrement for number fields
export type InferUpdateProps<T extends JSONSchema["properties"]> = {
  [K in keyof T]?: T[K]["type"] extends "number"
    ? number | IncrementDecrement
    : InferFieldType<T[K]>;
} & Partial<SystemFields>;
