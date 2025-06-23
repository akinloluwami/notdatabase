"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Trash2,
  Copy,
  Check,
  Loader2,
  Database,
  Calendar,
} from "lucide-react";
import Ttile from "@/components/ttile";

export default function DatabaseSettingsPage() {
  const { dbId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Delete database mutation
  const deleteDatabaseMutation = useMutation({
    mutationFn: () => apiClient.database.delete(dbId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      router.push("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  if (isLoadingDb) {
    return (
      <>
        <Ttile>Settings - NotDatabase</Ttile>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </>
    );
  }

  if (isErrorDb) {
    return (
      <>
        <Ttile>Error - NotDatabase</Ttile>
        <div className="p-8 text-red-400">{(dbError as Error).message}</div>
      </>
    );
  }

  return (
    <>
      <Ttile>Settings - {dbMeta?.name} - NotDatabase</Ttile>
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Database Settings</h1>
          <p className="text-gray-400 mt-2">
            Manage your database configuration
          </p>
        </header>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-transparent p-0 w-full justify-start rounded-none border-b border-border">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent p-3 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent p-3 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Database ID</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={dbId as string}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(dbId as string)}
                      >
                        {copiedValue === dbId ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Database Name</Label>
                    <Input value={dbMeta?.name || ""} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {dbMeta?.createdAt
                          ? new Date(dbMeta.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge variant="secondary" className="w-fit">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {dbMeta?.collectionCount || 0}
                    </div>
                    <div className="text-sm text-gray-400">Collections</div>
                  </div>
                  <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {dbMeta?.documentCount || 0}
                    </div>
                    <div className="text-sm text-gray-400">Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-md">
                  <h3 className="font-semibold text-red-400 mb-2">
                    Delete Database
                  </h3>
                  <p className="text-sm text-red-300 mb-4">
                    This action cannot be undone. This will permanently delete
                    the database "{dbMeta?.name}" and all of its data, including
                    all collections, documents, and API keys.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Database
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Database</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you absolutely sure? This action cannot be undone.
                          This will permanently delete the database "
                          {dbMeta?.name}" and all of its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteDatabaseMutation.mutate()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Database
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
