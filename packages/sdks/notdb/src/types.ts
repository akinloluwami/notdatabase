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

// Helper type to extract required keys from a schema
export type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never;
}[keyof T];

// Helper type to extract optional keys from a schema
export type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

export type InsertSchemaProps<T extends JSONSchema["properties"]> =
  // Required fields
  { [K in RequiredKeys<T>]: InferFieldType<T[K]> } & {
    // Optional fields
    [K in OptionalKeys<T>]?: InferFieldType<T[K]>;
  } & {
    key?: string;
  } & SystemFields;

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

// Typesafe filter operators for number fields
export type NumberFilterOperators = {
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
};

// Typesafe filter for a single field
export type FieldFilter<T> = T extends number
  ? number | NumberFilterOperators
  : T;

// Typesafe filter for a schema
export type InferFilterProps<T> = {
  [K in keyof T]?: FieldFilter<T[K]>;
};
