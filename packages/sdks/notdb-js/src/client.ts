import {
  CreateClientOptions,
  SchemaDefinition,
  JSONSchema,
  InferSchemaProps,
} from "./types.js";
import {
  getRequiredFields,
  getUniqueFields,
  applyDefaultValues,
} from "./utils.js";

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
      findMany: (options?: {
        filter?: Partial<InferSchemaProps<S[K]["properties"]>>;
        sort?: string;
        limit?: number;
        offset?: number;
      }) => Promise<any[]>;
    };
  };
}

class CollectionClient {
  constructor(
    private collection: string,
    private baseUrl: string,
    private apiKey: string,
    private schema: JSONSchema
  ) {}

  async insert(data: Record<string, any>) {
    const required = getRequiredFields(this.schema);
    const unique = getUniqueFields(this.schema);

    const payload = applyDefaultValues(this.schema, { ...data });

    for (const field of required) {
      if (!(field in payload)) {
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
        ...payload,
        unique,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Insert failed");
    }

    return res.json();
  }

  async findMany(options?: {
    filter?: Record<string, string | number | boolean>;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/${this.collection}/docs`);

    if (options?.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        url.searchParams.append(`filter[${key}]`, String(value));
      }
    }

    if (options?.sort) {
      url.searchParams.append("sort", options.sort);
    }

    if (options?.limit) {
      url.searchParams.append("limit", String(options.limit));
    }

    if (options?.offset) {
      url.searchParams.append("offset", String(options.offset));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to fetch documents");
    }

    return res.json();
  }
}
