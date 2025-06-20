"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";

export default function DatabasePage() {
  const { dbId } = useParams();
  const {
    data: dbMeta,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["database-meta", dbId],
    queryFn: () => apiClient.database.getMetaById(dbId as string),
    enabled: !!dbId,
  });

  const {
    data: collections,
    isLoading: isLoadingCollections,
    isError: isErrorCollections,
    error: collectionsError,
  } = useQuery({
    queryKey: ["database-collections", dbId],
    queryFn: () => apiClient.database.getCollections(dbId as string),
    enabled: !!dbId,
  });

  if (isLoading || isLoadingCollections)
    return <div className="p-8">Loading database...</div>;
  if (isError || isErrorCollections)
    return (
      <div className="p-8 text-red-400">
        {((error || collectionsError) as Error).message}
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">{dbMeta.name}</h1>
      <p className="text-gray-400 mb-2">ID: {dbMeta.id}</p>
      {/* Render more meta info as needed */}
      <pre className="bg-gray-900 p-4 rounded">
        {JSON.stringify(dbMeta, null, 2)}
      </pre>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Collections</h2>
        {collections && collections.length > 0 ? (
          <ul className="list-disc list-inside">
            {collections.map((col: string) => (
              <li key={col} className="text-lg">
                {col}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No collections found.</p>
        )}
      </div>
    </div>
  );
}
