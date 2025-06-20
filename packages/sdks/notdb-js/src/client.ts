import {
  CreateClientOptions,
  SchemaDefinition,
  JSONSchema,
  InferSchemaProps,
} from "./types.js";
import { getRequiredFields, getUniqueFields } from "./utils.js";

const DEFAULT_BASE_URL = "http://localhost:3344";

export function createClient<S extends SchemaDefinition>(
  opts: Omit<CreateClientOptions, "baseUrl"> & { schema: S }
) {
  const handler: Record<string, any> = {};

  for (const collection in opts.schema) {
    const schema = opts.schema[collection];
    handler[collection] = new CollectionClient(
      collection,
      DEFAULT_BASE_URL,
      opts.apiKey,
      schema
    );
  }

  return handler as {
    [K in keyof S]: {
      insert: (data: InferSchemaProps<S[K]["properties"]>) => Promise<any>;
    };
  };
}

class CollectionClient {
  private collection: string;
  private baseUrl: string;
  private apiKey: string;
  private schema: JSONSchema;

  constructor(
    collection: string,
    baseUrl: string,
    apiKey: string,
    schema: JSONSchema
  ) {
    this.collection = collection;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.schema = schema;
  }

  async insert(data: Record<string, any>) {
    const required = getRequiredFields(this.schema);
    const unique = getUniqueFields(this.schema);

    for (const field of required) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const res = await fetch(`${this.baseUrl}/${this.collection}/docs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        unique,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Insert failed");
    }

    return res.json();
  }
}
