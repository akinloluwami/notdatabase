"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import Link from "next/link";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dbName, setDbName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch databases
  const {
    data: databases,
    isLoading: isDbLoading,
    isError: isDbError,
    error: dbError,
  } = useQuery({
    queryKey: ["databases"],
    queryFn: apiClient.database.list,
  });

  // Create database mutation
  const createDatabaseMutation = useMutation({
    mutationFn: (name: string) => apiClient.database.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      setIsModalOpen(false);
      setDbName("");
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createDatabaseMutation.mutate(dbName);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setError(null);
            setDbName("");
          }}
          className="bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-all duration-200"
        >
          Create database
        </button>
      </header>

      <main>
        {isDbLoading ? (
          <p>Loading databases...</p>
        ) : isDbError ? (
          <p className="text-red-400">{(dbError as Error).message}</p>
        ) : databases && databases.length > 0 ? (
          <ul className="space-y-2">
            {databases.map((db: any) => (
              <li
                key={db.id}
                className="bg-gray-800 border border-gray-700 rounded-md p-4 hover:bg-gray-700 transition"
              >
                <Link href={`/dashboard/databases/${db.id}`}>
                  <span className="font-medium">{db.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{db.id}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Your databases will be listed here.</p>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">
              Create New Database
            </h2>
            <form onSubmit={handleCreateDatabase} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded-md text-red-200 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="dbName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Database Name
                </label>
                <input
                  id="dbName"
                  name="dbName"
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="Enter database name"
                  disabled={createDatabaseMutation.isPending}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-md font-medium bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                  disabled={createDatabaseMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDatabaseMutation.isPending}
                  className="bg-white text-black py-2 px-4 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createDatabaseMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
