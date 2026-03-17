"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Copy, Check, Loader2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { DatabaseIcon } from "@hugeicons/core-free-icons";
import Ttile from "@/components/ttile";

export default function DatabaseSettingsPage() {
  const { dbId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

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

  const deleteDatabaseMutation = useMutation({
    mutationFn: () => apiClient.database.delete(dbId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      router.push("/dashboard");
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

  const canDelete = deleteConfirmName === dbMeta?.name;

  return (
    <>
      <Ttile>Settings - {dbMeta?.name} - NotDatabase</Ttile>
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-8">Settings</h1>

        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Database information
          </h2>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-sm text-white font-medium">
                  {dbMeta?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Database ID</p>
                <p className="text-sm text-gray-300 font-mono truncate">
                  {dbId}
                </p>
              </div>
              <button
                onClick={() => handleCopy(dbId as string)}
                className="ml-3 p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              >
                {copiedValue === dbId ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Created</p>
                <p className="text-sm text-gray-300">
                  {dbMeta?.createdAt
                    ? new Date(dbMeta.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-sm text-white">Active</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4">
            Danger zone
          </h2>

          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">
                  Delete this database
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Permanently delete &ldquo;{dbMeta?.name}&rdquo; and all its
                  data, including collections, documents, and API keys.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setShowDeleteDialog(true);
                  setDeleteConfirmName("");
                }}
                className="shrink-0 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </section>

        <Dialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) setDeleteConfirmName("");
          }}
        >
          <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <DialogHeader className="space-y-1 p-0">
                <DialogTitle className="text-lg">Delete database</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  This will permanently delete &ldquo;{dbMeta?.name}&rdquo; and
                  all its data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5">
                <label className="block text-sm text-gray-400 mb-2">
                  Type <span className="font-medium text-white">{dbMeta?.name}</span> to
                  confirm
                </label>
                <Input
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={dbMeta?.name}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-white/[0.15] h-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteDatabaseMutation.isPending}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!canDelete || deleteDatabaseMutation.isPending}
                onClick={() => deleteDatabaseMutation.mutate()}
                className="rounded-lg px-4 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
              >
                {deleteDatabaseMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete database"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
