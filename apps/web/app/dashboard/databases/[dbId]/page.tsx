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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  Key,
  Settings,
  FolderOpen,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

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

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isErrorAnalytics,
    error: analyticsError,
  } = useQuery({
    queryKey: ["database-analytics", dbId],
    queryFn: () => apiClient.database.getAnalytics(dbId as string),
    enabled: !!dbId,
  });

  if (isLoading || isLoadingCollections || isLoadingAnalytics)
    return <div className="p-8">Loading database...</div>;
  if (isError || isErrorCollections || isErrorAnalytics)
    return (
      <div className="p-8 text-red-400">
        {((error || collectionsError || analyticsError) as Error).message}
      </div>
    );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>{dbMeta.name}</SidebarHeader>
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
                      <SidebarMenuButton asChild>
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
          <h1 className="text-2xl font-semibold mb-6">{dbMeta.name}</h1>

          {/* Analytics Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Events */}
              <Card className="border-gray-100/20 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.total || 0}
                  </div>
                </CardContent>
              </Card>

              {/* Create Events */}
              <Card className="border-gray-100/20 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-400" />
                    CREATE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.byAction?.CREATE || 0}
                  </div>
                </CardContent>
              </Card>

              {/* Read Events */}
              <Card className="border-gray-100/20 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    READ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.byAction?.READ || 0}
                  </div>
                </CardContent>
              </Card>

              {/* Update Events */}
              <Card className="border-gray-100/20 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Edit className="h-4 w-4 text-yellow-400" />
                    UPDATE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.byAction?.UPDATE || 0}
                  </div>
                </CardContent>
              </Card>

              {/* Delete Events */}
              <Card className="border-gray-100/20 bg-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-400" />
                    DELETE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.byAction?.DELETE || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
