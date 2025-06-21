"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function ApiKeysPage() {
  const { dbId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

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

  // Fetch API keys
  const {
    data: apiKeys,
    isLoading: isLoadingKeys,
    isError: isErrorKeys,
    error: keysError,
  } = useQuery({
    queryKey: ["api-keys", dbId],
    queryFn: () => apiClient.apiKeys.list(dbId as string),
    enabled: !!dbId,
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: (name: string) =>
      apiClient.apiKeys.create(dbId as string, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", dbId] });
      setIsCreateModalOpen(false);
      setNewKeyName("");
    },
    onError: (err: any) => {
      console.error("Failed to create API key:", err);
    },
  });

  // Revoke API key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: string) =>
      apiClient.apiKeys.revoke(dbId as string, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", dbId] });
    },
    onError: (err: any) => {
      console.error("Failed to revoke API key:", err);
    },
  });

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.trim()) {
      createKeyMutation.mutate(newKeyName.trim());
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy key:", err);
    }
  };

  const handleToggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleRevokeKey = (keyId: string) => {
    if (
      confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone."
      )
    ) {
      setLoadingKeys((prev) => new Set(prev).add(keyId));
      revokeKeyMutation.mutate(keyId, {
        onSettled: () => {
          setLoadingKeys((prev) => {
            const newSet = new Set(prev);
            newSet.delete(keyId);
            return newSet;
          });
        },
      });
    }
  };

  if (isLoadingDb) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">Loading database...</p>
        </div>
      </div>
    );
  }

  if (isErrorDb) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-400 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <span>Error loading database</span>
        </div>
        <p className="text-gray-400">{(dbError as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for {dbMeta?.name}
          </p>
        </div>
        <Button
          onClick={() => {
            setIsCreateModalOpen(true);
            setNewKeyName("");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      <div className="space-y-4">
        {isLoadingKeys ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading API keys...</p>
            </div>
          </div>
        ) : isErrorKeys ? (
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading API keys</span>
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          apiKeys.map((key: any) => (
            <Card key={key.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span>{key.name}</span>
                    {key.revoked && (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!key.revoked && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          {copiedKey === key.key ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                    {!key.revoked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-destructive hover:bg-destructive/10"
                        disabled={loadingKeys.has(key.id)}
                      >
                        {loadingKeys.has(key.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {visibleKeys.has(key.id) && !key.revoked ? (
                    <div className="bg-muted p-3 rounded border">
                      <code className="text-sm break-all">{key.key}</code>
                    </div>
                  ) : (
                    <div className="bg-muted p-3 rounded border">
                      <code className="text-sm text-muted-foreground">
                        {key.revoked
                          ? "••••••••••••••••••••••••••••••••"
                          : "••••••••••••••••••••••••••••••••"}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                    {key.lastUsed && (
                      <span>
                        Last used {new Date(key.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to start using the database
              </p>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(true);
                  setNewKeyName("");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create API Key Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateKey}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="keyName"
                  className="block text-sm font-medium mb-2"
                >
                  Key Name
                </label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  disabled={createKeyMutation.isPending}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={createKeyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newKeyName.trim() || createKeyMutation.isPending}
              >
                {createKeyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Key"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
