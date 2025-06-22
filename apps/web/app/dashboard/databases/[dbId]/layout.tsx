"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Key, Settings, FolderOpen, Loader2 } from "lucide-react";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dbId } = useParams();
  const pathname = usePathname();
  const router = useRouter();

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

  const { data: databases, isLoading: isLoadingDatabases } = useQuery({
    queryKey: ["databases"],
    queryFn: apiClient.database.list,
  });

  if (isLoading || isLoadingCollections)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">Loading database...</p>
        </div>
      </div>
    );
  if (isError || isErrorCollections)
    return (
      <div className="p-8 text-red-400">
        {((error || collectionsError) as Error).message}
      </div>
    );

  const handleDatabaseChange = (selectedDbId: string) => {
    // Navigate to the overview page of the selected database
    router.push(`/dashboard/databases/${selectedDbId}`);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex flex-row">
          <Link href="/dashboard">
            <img
              src="https://api.iconify.design/solar:box-minimalistic-bold-duotone.svg?color=%23888888"
              className="w-8"
            />
          </Link>
          <Select value={dbId as string} onValueChange={handleDatabaseChange}>
            <SelectTrigger className="w-full border-none bg-transparent text-left font-semibold hover:bg-accent/50">
              <SelectValue placeholder="Select database" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingDatabases ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading databases...
                  </div>
                </SelectItem>
              ) : (
                databases?.map((db: { id: string; name: string }) => (
                  <SelectItem key={db.id} value={db.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {db.name}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/dashboard/databases/${dbId}`}
              >
                <Link href={`/dashboard/databases/${dbId}`}>
                  <Database className="h-4 w-4" />
                  Overview
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
                        isActive={
                          pathname ===
                          `/dashboard/databases/${dbId}/collections/${col}`
                        }
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
                      No collections
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                )}
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/dashboard/databases/${dbId}/api-keys`}
              >
                <Link href={`/dashboard/databases/${dbId}/api-keys`}>
                  <Key className="h-4 w-4" />
                  API Keys
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/dashboard/databases/${dbId}/settings`}
              >
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
        <div className="min-h-screen bg-black text-white">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
