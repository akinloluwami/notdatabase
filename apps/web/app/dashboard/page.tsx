"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Settings, Database, Loader2 } from "lucide-react";

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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex flex-row items-center">
          <img
            src="https://api.iconify.design/solar:box-minimalistic-bold-duotone.svg?color=%23888888"
            className="w-8"
          />
          <p className="text-lg font-semibold">NotDatabase</p>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Databases
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Databases</h1>
            <div className="flex items-center space-x-4">
              <Input placeholder="Search databases" className="w-64" />
              <Button
                onClick={() => {
                  setIsModalOpen(true);
                  setError(null);
                  setDbName("");
                }}
              >
                New database
              </Button>
            </div>
          </header>
          <main>
            {isDbLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">Loading databases...</p>
                </div>
              </div>
            ) : isDbError ? (
              <p className="text-red-400">{(dbError as Error).message}</p>
            ) : databases && databases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {databases.map((db: any) => (
                  <Card key={db.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <Link
                          href={`/dashboard/databases/${db.id}`}
                          className="flex items-center"
                        >
                          {db.name}
                          <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-400">
                        <Database className="h-4 w-4 mr-2" />
                        Database sleeping
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Schema last updated 1 year ago
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>Your databases will be listed here.</p>
            )}
          </main>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Database</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDatabase} className="space-y-4 py-4">
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
                <Input
                  id="dbName"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="Enter database name"
                  disabled={createDatabaseMutation.isPending}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={createDatabaseMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createDatabaseMutation.isPending}
                >
                  {createDatabaseMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
