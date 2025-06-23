export const apiClient = {
  database: {
    create: async (name: string) => {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create database");
      }

      return response.json();
    },
    list: async () => {
      const response = await fetch("/api/databases");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch databases");
      }

      return response.json();
    },
    getMetaById: async (dbId: string) => {
      const response = await fetch(`/api/databases/${dbId}/meta`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch database");
      }

      return response.json();
    },
    getCollections: async (dbId: string) => {
      const response = await fetch(`/api/databases/${dbId}/collections`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch collections");
      }

      return response.json();
    },
    getAnalytics: async (dbId: string, timeFrame?: string) => {
      const url = new URL(
        `/api/databases/${dbId}/analytics`,
        window.location.origin
      );
      if (timeFrame) {
        url.searchParams.set("timeFrame", timeFrame);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      return response.json();
    },
    delete: async (dbId: string) => {
      const response = await fetch(`/api/databases/${dbId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete database");
      }

      return response.json();
    },
  },
  apiKeys: {
    list: async (dbId: string) => {
      const response = await fetch(`/api/databases/${dbId}/api-keys`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch API keys");
      }

      return response.json();
    },
    create: async (dbId: string, name: string) => {
      const response = await fetch(`/api/databases/${dbId}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create API key");
      }

      return response.json();
    },
    revoke: async (dbId: string, keyId: string) => {
      const response = await fetch(`/api/databases/${dbId}/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to revoke API key");
      }

      return response.json();
    },
  },
  collection: {
    getDocuments: async (
      dbId: string,
      collectionName: string,
      options?: {
        limit?: number;
        offset?: number;
        sort?: string;
        filters?: Record<string, any>;
      }
    ) => {
      const url = new URL(
        `/api/databases/${dbId}/collections/${collectionName}/docs`,
        window.location.origin
      );

      if (options?.limit)
        url.searchParams.set("limit", options.limit.toString());
      if (options?.offset)
        url.searchParams.set("offset", options.offset.toString());
      if (options?.sort) url.searchParams.set("sort", options.sort);

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          url.searchParams.set(`filter[${key}]`, value.toString());
        });
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch documents");
      }

      return response.json();
    },
    getDocument: async (
      dbId: string,
      collectionName: string,
      documentId: string
    ) => {
      const response = await fetch(
        `/api/databases/${dbId}/collections/${collectionName}/docs/${documentId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch document");
      }

      return response.json();
    },
    getCount: async (
      dbId: string,
      collectionName: string,
      filters?: Record<string, any>
    ) => {
      const url = new URL(
        `/api/databases/${dbId}/collections/${collectionName}/count`,
        window.location.origin
      );

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          url.searchParams.set(`filter[${key}]`, value.toString());
        });
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch count");
      }

      return response.json();
    },
  },
};
