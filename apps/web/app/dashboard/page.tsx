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
import { Home, Settings, Database, Loader2, Copy, Check } from "lucide-react";
import Ttile from "@/components/ttile";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [dbName, setDbName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdDatabase, setCreatedDatabase] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: databases,
    isLoading: isDbLoading,
    isError: isDbError,
    error: dbError,
  } = useQuery({
    queryKey: ["databases"],
    queryFn: apiClient.database.list,
  });

  const createDatabaseMutation = useMutation({
    mutationFn: (name: string) => apiClient.database.create(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      setIsModalOpen(false);
      setDbName("");
      setCreatedDatabase(data);
      setIsApiKeyModalOpen(true);
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

  const handleCopyApiKey = async () => {
    if (createdDatabase?.apiKey) {
      await navigator.clipboard.writeText(createdDatabase.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Ttile>Dashboard - NotDatabase</Ttile>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="flex flex-row items-center">
            <img src="/logo.png" className="w-8" />
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
              {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
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
                          {db.collectionCount || 0} collections,{" "}
                          {db.documentCount || 0} documents
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>Your databases will be listed here.</p>
              )}
            </main>
          </div>

          {/* Create Database Modal */}
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
                    {createDatabaseMutation.isPending
                      ? "Creating..."
                      : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* API Key Modal */}
          <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Database Created Successfully!</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-md">
                  <p className="text-green-200 text-sm mb-2">
                    Your database "{createdDatabase?.name}" has been created
                    successfully.
                  </p>
                  <p className="text-green-200 text-sm">Here's your API key.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={createdDatabase?.apiKey || ""}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyApiKey}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-green-400 text-xs mt-1">
                      Copied to clipboard!
                    </p>
                  )}
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700 rounded-md p-3">
                  <p className="text-yellow-200 text-xs">
                    ⚠️ Keep this API key secure. You can manage your API keys in
                    the database settings.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="w-full"
                >
                  Got it!
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
