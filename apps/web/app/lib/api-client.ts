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
  },
};
