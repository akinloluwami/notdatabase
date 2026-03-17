"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Key01Icon } from "@hugeicons/core-free-icons";
import Ttile from "@/components/ttile";

export default function ApiKeysPage() {
  const { dbId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

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

  const {
    data: apiKeys,
    isLoading: isLoadingKeys,
    isError: isErrorKeys,
  } = useQuery({
    queryKey: ["api-keys", dbId],
    queryFn: () => apiClient.apiKeys.list(dbId as string),
    enabled: !!dbId,
  });

  const createKeyMutation = useMutation({
    mutationFn: (name: string) =>
      apiClient.apiKeys.create(dbId as string, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", dbId] });
      setIsCreateModalOpen(false);
      setNewKeyName("");
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: string) =>
      apiClient.apiKeys.revoke(dbId as string, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", dbId] });
    },
  });

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.trim()) {
      createKeyMutation.mutate(newKeyName.trim());
    }
  };

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(keyId) ? next.delete(keyId) : next.add(keyId);
      return next;
    });
  };

  const handleRevokeKey = (keyId: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    setLoadingKeys((prev) => new Set(prev).add(keyId));
    revokeKeyMutation.mutate(keyId, {
      onSettled: () => {
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyId);
          return next;
        });
      },
    });
  };

  if (isLoadingDb) {
    return (
      <>
        <Ttile>API Keys - NotDatabase</Ttile>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      </>
    );
  }

  if (isErrorDb) {
    return (
      <>
        <Ttile>Error - NotDatabase</Ttile>
        <div className="p-6 lg:p-10">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">{(dbError as Error).message}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Ttile>API Keys - {dbMeta?.name || "Database"} - NotDatabase</Ttile>
      <div className="p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage API keys for {dbMeta?.name}
            </p>
          </div>
          <Button
            onClick={() => {
              setIsCreateModalOpen(true);
              setNewKeyName("");
            }}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4" />
            Create key
          </Button>
        </div>

        {isLoadingKeys ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-32 rounded bg-white/[0.06]" />
                  <div className="h-4 w-20 rounded bg-white/[0.06]" />
                </div>
                <div className="h-10 w-full rounded-lg bg-white/[0.04]" />
              </div>
            ))}
          </div>
        ) : isErrorKeys ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">Failed to load API keys</p>
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.06]">
            {apiKeys.map((key: any) => (
              <div
                key={key.id}
                className={`p-5 ${key.revoked ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <HugeiconsIcon
                      icon={Key01Icon}
                      size={16}
                      className="text-gray-500"
                    />
                    <span className="text-sm font-medium text-white">
                      {key.name}
                    </span>
                    {key.revoked && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
                        Revoked
                      </span>
                    )}
                  </div>
                  {!key.revoked && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleKeyVisibility(key.id)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyKey(key.key)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        {copiedKey === key.key ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={loadingKeys.has(key.id)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {loadingKeys.has(key.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                  <code className="text-[13px] break-all text-gray-400 font-mono">
                    {!key.revoked && visibleKeys.has(key.id)
                      ? key.key
                      : "••••••••••••••••••••••••••••••••"}
                  </code>
                </div>

                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-gray-600">
                  <span>
                    Created {new Date(key.createdAt).toLocaleDateString()}
                  </span>
                  {key.lastUsed && (
                    <>
                      <span className="text-gray-700">&middot;</span>
                      <span>
                        Last used {new Date(key.lastUsed).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon
                icon={Key01Icon}
                size={20}
                className="text-gray-500"
              />
            </div>
            <h3 className="font-medium text-white mb-1">No API keys yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Create your first API key to start using the database.
            </p>
            <Button
              onClick={() => {
                setIsCreateModalOpen(true);
                setNewKeyName("");
              }}
              className="rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Create key
            </Button>
          </div>
        )}

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
            <form onSubmit={handleCreateKey}>
              <div className="px-6 pt-6 pb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5">
                  <HugeiconsIcon
                    icon={Key01Icon}
                    size={20}
                    className="text-gray-400"
                  />
                </div>
                <DialogHeader className="space-y-1 p-0">
                  <DialogTitle className="text-lg">Create API key</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Give your key a name to identify it later.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production"
                    disabled={createKeyMutation.isPending}
                    className="bg-white/[0.03] border-white/[0.08] focus:border-white/[0.15] h-10"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={createKeyMutation.isPending}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !newKeyName.trim() || createKeyMutation.isPending
                  }
                  className="rounded-lg px-4"
                >
                  {createKeyMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create key"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
