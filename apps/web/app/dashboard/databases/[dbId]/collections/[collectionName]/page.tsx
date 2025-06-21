"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Database,
  Key,
  Settings,
  FolderOpen,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CollectionPage() {
  const { dbId, collectionName } = useParams();

  // Fetch database metadata
  const {
    data: dbMeta,
    isLoading: isLoadingDb,
    isError: isErrorDb,
    error: dbError,
  } = useQuery({
    queryKey: ["database-meta", dbId],
    queryFn: () => apiClient.database.getMetaById(dbId as string),
    enabled: !!dbId,
  });

  // Fetch collections for sidebar
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

  // Fetch documents from the collection
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    isError: isErrorDocuments,
    error: documentsError,
  } = useQuery({
    queryKey: ["collection-documents", dbId, collectionName],
    queryFn: () =>
      apiClient.collection.getDocuments(
        dbId as string,
        collectionName as string
      ),
    enabled: !!dbId && !!collectionName,
  });

  // Fetch document count
  const { data: countData, isLoading: isLoadingCount } = useQuery({
    queryKey: ["collection-count", dbId, collectionName],
    queryFn: () =>
      apiClient.collection.getCount(dbId as string, collectionName as string),
    enabled: !!dbId && !!collectionName,
  });

  if (isErrorDb || isErrorCollections || isErrorDocuments)
    return (
      <div className="p-8 text-red-400">
        {((dbError || collectionsError || documentsError) as Error).message}
      </div>
    );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>{dbMeta?.name || "Loading..."}</SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub>
                <SidebarMenuSubButton>
                  <FolderOpen className="h-4 w-4" />
                  Collections
                </SidebarMenuSubButton>
                {collections && collections.length > 0 ? (
                  collections.map((col: string) => (
                    <SidebarMenuSubItem key={col}>
                      <SidebarMenuButton
                        asChild
                        isActive={col === collectionName}
                      >
                        <Link
                          href={`/dashboard/databases/${dbId}/collections/${col}`}
                        >
                          {col}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSubItem>
                  ))
                ) : (
                  <SidebarMenuSubItem>
                    <SidebarMenuButton disabled>
                      {isLoadingCollections ? "Loading..." : "No collections"}
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/dashboard/databases/${dbId}/api-keys`}>
                  <Key className="h-4 w-4" />
                  API Keys
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={`/dashboard/databases/${dbId}/settings`}>
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-black text-white p-8">
          {isLoadingDb || isLoadingCollections || isLoadingDocuments ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-xl">Loading collection...</p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{collectionName}</h1>
                  <p className="text-gray-400">
                    {countData?.count || 0} documents
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-10 w-64 bg-gray-900 border-gray-700"
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              </header>

              <main>
                {documents && documents.length > 0 ? (
                  <div className="grid gap-4">
                    {documents.map((doc: any) => (
                      <Card key={doc._id} className="border-gray-100/20">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg">{doc._id}</span>
                            <div className="text-sm text-gray-400">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            {JSON.stringify(doc, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No documents found in this collection.
                    </p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first document
                    </Button>
                  </div>
                )}
              </main>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
