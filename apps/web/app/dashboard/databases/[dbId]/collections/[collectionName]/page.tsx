"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Pencil, Copy, Check } from "lucide-react";
import Ttile from "@/components/ttile";

export default function CollectionPage() {
  const { dbId, collectionName } = useParams();
  const queryClient = useQueryClient();

  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [docInput, setDocInput] = useState("{\n  \n}");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    data: dbMeta,
    isLoading: isLoadingDb,
  } = useQuery({
    queryKey: ["database-meta", dbId],
    queryFn: () => apiClient.database.getMetaById(dbId as string),
    enabled: !!dbId,
  });

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

  const { data: countData } = useQuery({
    queryKey: ["collection-count", dbId, collectionName],
    queryFn: () =>
      apiClient.collection.getCount(dbId as string, collectionName as string),
    enabled: !!dbId && !!collectionName,
  });

  const createDocMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      apiClient.collection.createDocument(
        dbId as string,
        collectionName as string,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection-documents", dbId, collectionName],
      });
      queryClient.invalidateQueries({
        queryKey: ["collection-count", dbId, collectionName],
      });
      queryClient.invalidateQueries({
        queryKey: ["database-collections", dbId],
      });
      setShowCreateDoc(false);
      setDocInput("{\n  \n}");
      setJsonError(null);
    },
  });

  const updateDocMutation = useMutation({
    mutationFn: ({
      documentId,
      data,
    }: {
      documentId: string;
      data: Record<string, any>;
    }) =>
      apiClient.collection.updateDocument(
        dbId as string,
        collectionName as string,
        documentId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection-documents", dbId, collectionName],
      });
      setEditingDoc(null);
      setDocInput("{\n  \n}");
      setJsonError(null);
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiClient.collection.deleteDocument(
        dbId as string,
        collectionName as string,
        documentId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection-documents", dbId, collectionName],
      });
      queryClient.invalidateQueries({
        queryKey: ["collection-count", dbId, collectionName],
      });
      setDeleteTarget(null);
    },
  });

  const handleSubmitDoc = () => {
    try {
      const parsed = JSON.parse(docInput);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("Document must be a JSON object");
        return;
      }
      setJsonError(null);

      if (editingDoc) {
        const { _id, createdAt, updatedAt, ...cleanData } = parsed;
        updateDocMutation.mutate({
          documentId: editingDoc._id,
          data: cleanData,
        });
      } else {
        createDocMutation.mutate(parsed);
      }
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (doc: any) => {
    const { _id, createdAt, updatedAt, _seed, ...editableFields } = doc;
    setEditingDoc(doc);
    setDocInput(JSON.stringify(editableFields, null, 2));
    setJsonError(null);
  };

  const openCreate = () => {
    setEditingDoc(null);
    setDocInput("{\n  \n}");
    setJsonError(null);
    setShowCreateDoc(true);
  };

  const visibleDocs = (documents || []).filter((doc: any) => !doc._seed);

  if (isLoadingDb || isLoadingDocuments) {
    return (
      <>
        <Ttile>Loading Collection - NotDatabase</Ttile>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      </>
    );
  }

  if (isErrorDocuments) {
    return (
      <>
        <Ttile>Error - NotDatabase</Ttile>
        <div className="p-6 lg:p-10">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-400">
              {(documentsError as Error).message}
            </p>
          </div>
        </div>
      </>
    );
  }

  const docCount =
    countData?.count != null
      ? countData.count - (documents || []).filter((d: any) => d._seed).length
      : visibleDocs.length;

  return (
    <>
      <Ttile>
        {collectionName} - {dbMeta?.name || "Database"} - NotDatabase
      </Ttile>
      <div className="p-6 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {collectionName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {docCount} {docCount === 1 ? "document" : "documents"}
            </p>
          </div>
          <Button size="sm" onClick={openCreate} className="rounded-lg gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add document
          </Button>
        </div>

        {visibleDocs.length > 0 ? (
          <div className="space-y-2">
            {visibleDocs.map((doc: any) => (
              <div
                key={doc._id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-500 font-mono truncate">
                      {doc._id}
                    </span>
                    <button
                      onClick={() => handleCopyId(doc._id)}
                      className="p-0.5 rounded text-gray-600 hover:text-white transition-colors shrink-0"
                    >
                      {copiedId === doc._id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-600 mr-2">
                      {new Date(doc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => openEdit(doc)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(doc)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <pre className="px-4 py-3 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                  {JSON.stringify(doc, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
            <div className="text-gray-600 mb-3">
              <FolderIcon className="h-10 w-10 mx-auto" />
            </div>
            <p className="text-sm text-gray-400 mb-1">No documents yet</p>
            <p className="text-xs text-gray-600 mb-4">
              Add your first document to this collection
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={openCreate}
              className="rounded-lg gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add document
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={showCreateDoc || !!editingDoc}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDoc(false);
            setEditingDoc(null);
            setDocInput("{\n  \n}");
            setJsonError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader className="space-y-1 p-0">
              <DialogTitle className="text-lg">
                {editingDoc ? "Edit document" : "Add document"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {editingDoc
                  ? "Modify the JSON fields below. System fields (_id, createdAt, updatedAt) are managed automatically."
                  : "Write a JSON object for the new document. An _id will be generated automatically."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <textarea
                value={docInput}
                onChange={(e) => {
                  setDocInput(e.target.value);
                  setJsonError(null);
                }}
                spellCheck={false}
                className="w-full h-56 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-mono text-gray-200 resize-none focus:outline-none focus:border-white/[0.15] transition-colors placeholder:text-gray-600"
                placeholder='{ "name": "value" }'
              />
              {jsonError && (
                <p className="mt-1.5 text-xs text-red-400">{jsonError}</p>
              )}
              {(createDocMutation.isError || updateDocMutation.isError) && (
                <p className="mt-1.5 text-xs text-red-400">
                  {(createDocMutation.error || updateDocMutation.error)?.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateDoc(false);
                setEditingDoc(null);
              }}
              disabled={
                createDocMutation.isPending || updateDocMutation.isPending
              }
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitDoc}
              disabled={
                createDocMutation.isPending || updateDocMutation.isPending
              }
              className="rounded-lg px-4"
            >
              {createDocMutation.isPending || updateDocMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : editingDoc ? (
                "Save changes"
              ) : (
                "Create document"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <DialogHeader className="space-y-1 p-0">
              <DialogTitle className="text-lg">Delete document</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Are you sure you want to delete this document? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deleteTarget && (
              <p className="mt-3 text-xs text-gray-600 font-mono truncate">
                ID: {deleteTarget._id}
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteDocMutation.isPending}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => deleteDocMutation.mutate(deleteTarget._id)}
              disabled={deleteDocMutation.isPending}
              className="rounded-lg px-4 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteDocMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
