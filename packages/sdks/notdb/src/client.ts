import {
  CreateClientOptions,
  SchemaDefinition,
  JSONSchema,
  InferSchemaProps,
  SelectFields,
  InferSelected,
  InsertSchemaProps,
  InferUpdateProps,
  InferFilterProps,
} from "./types.js";
import {
  getRequiredFields,
  getUniqueFields,
  applyDefaultValues,
} from "./utils.js";

const DEFAULT_BASE_URL = "https://api.notdatabase.com";

function createRealtimeMethods(baseUrl: string, apiKey: string) {
  return {
    async generateToken(options?: {
      expiresIn?: string;
      collections?: string[];
    }): Promise<string> {
      const res = await fetch(`${baseUrl}/realtime/token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options ?? {}),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to generate realtime token");
      }

      const json = await res.json();
      return json.token;
    },
  };
}

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

  return {
    ...(handler as {
      [K in keyof S]: {
        insert: (data: InsertSchemaProps<S[K]["properties"]>) => Promise<any>;
        find: (options?: {
          filter?: InferFilterProps<InferSchemaProps<S[K]["properties"]>>;
          sort?: string;
          limit?: number;
          offset?: number;
        }) => Promise<any[]>;
        get: <
          Select extends SelectFields<InferSchemaProps<S[K]["properties"]>>,
        >(
          id: string,
          options?: { select?: Select }
        ) => Promise<
          InferSelected<InferSchemaProps<S[K]["properties"]>, Select>
        >;
        update: (
          id: string,
          data: InferUpdateProps<S[K]["properties"]>
        ) => Promise<any>;
        delete: (id: string) => Promise<any>;
        insertBulk: (
          data: InsertSchemaProps<S[K]["properties"]>[]
        ) => Promise<any>;
        count: (options?: {
          filter?: InferFilterProps<InferSchemaProps<S[K]["properties"]>>;
        }) => Promise<number>;
      };
    }),
    realtime: createRealtimeMethods(DEFAULT_BASE_URL, opts.apiKey),
  };
}

class CollectionClient<TSchema extends JSONSchema = JSONSchema> {
  constructor(
    private collection: string,
    private baseUrl: string,
    private apiKey: string,
    private schema: TSchema
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

    if (data.key !== undefined) {
      payload.key = data.key;
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

  async find(options?: {
    filter?: InferFilterProps<InferSchemaProps<TSchema["properties"]>>;
    sort?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/${this.collection}/docs`);

    if (options?.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          // Advanced filter operators
          for (const [op, opValue] of Object.entries(value)) {
            url.searchParams.append(`filter[${key}][${op}]`, String(opValue));
          }
        } else {
          // Simple equality
          url.searchParams.append(`filter[${key}]`, String(value));
        }
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

  async get<Select extends SelectFields<any>>(
    id: string,
    options?: { select?: Select }
  ): Promise<any> {
    const url = new URL(`${this.baseUrl}/${this.collection}/docs/${id}`);

    let hasSelect = false;
    const selectedFields = new Set<string>();

    if (options?.select) {
      for (const [key, value] of Object.entries(options.select)) {
        if (value) {
          selectedFields.add(key);
          hasSelect = true;
        }
      }
    }

    if (hasSelect) {
      url.searchParams.set("select", Array.from(selectedFields).join(","));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to fetch document");
    }

    return res.json();
  }

  async update(id: string, data: Partial<InferSchemaProps<any>>) {
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch(`${this.baseUrl}/${this.collection}/docs/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Update failed");
    }

    return res.json();
  }

  async delete(id: string) {
    const res = await fetch(`${this.baseUrl}/${this.collection}/docs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Delete failed");
    }

    return res.json();
  }

  async insertBulk(data: Record<string, any>[]) {
    const required = getRequiredFields(this.schema);
    const unique = getUniqueFields(this.schema);

    const payload = data.map((doc) => {
      const withDefaults = applyDefaultValues(this.schema, { ...doc });

      for (const field of required) {
        if (!(field in withDefaults)) {
          throw new Error(
            `Missing required field '${field}' in one of the documents.`
          );
        }
      }

      if (doc.key !== undefined) {
        withDefaults.key = doc.key;
      }

      return {
        ...withDefaults,
        unique,
      };
    });

    const res = await fetch(`${this.baseUrl}/${this.collection}/bulk`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Insert bulk failed");
    }

    return res.json();
  }

  async count(options?: {
    filter?: InferFilterProps<InferSchemaProps<TSchema["properties"]>>;
  }): Promise<number> {
    const url = new URL(`${this.baseUrl}/${this.collection}/count`);

    if (options?.filter) {
      for (const [key, value] of Object.entries(options.filter)) {
        url.searchParams.append(`filter[${key}]`, String(value));
      }
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to fetch count");
    }

    const json = await res.json();
    return json.count;
  }
}
