"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Pencil, Copy, Check, X, ChevronDown } from "lucide-react";
import Ttile from "@/components/ttile";

type KvField = { key: string; value: string; type: "string" | "number" | "boolean" };

function parseValueByType(value: string, type: KvField["type"]): any {
  if (type === "number") return Number(value) || 0;
  if (type === "boolean") return value === "true";
  return value;
}

function detectType(val: any): KvField["type"] {
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  return "string";
}

function docToFields(doc: Record<string, any>): KvField[] {
  const systemKeys = new Set(["_id", "createdAt", "updatedAt", "_seed"]);
  return Object.entries(doc)
    .filter(([k]) => !systemKeys.has(k))
    .map(([key, val]) => ({
      key,
      value: String(val),
      type: detectType(val),
    }));
}

function fieldsToDoc(fields: KvField[]): Record<string, any> {
  const doc: Record<string, any> = {};
  for (const f of fields) {
    if (f.key.trim()) {
      doc[f.key.trim()] = parseValueByType(f.value, f.type);
    }
  }
  return doc;
}

const typeOptions: { value: KvField["type"]; label: string; color: string; bg: string; border: string }[] = [
  { value: "string", label: "str", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { value: "number", label: "num", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { value: "boolean", label: "bool", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
];

function Modal({
  open,
  onClose,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${width} mx-4 rounded-xl border border-white/[0.08] bg-[#0a0a0a] shadow-2xl shadow-black/60`}
      >
        {children}
      </div>
    </div>
  );
}

function TypeDropdown({
  value,
  onChange,
}: {
  value: KvField["type"];
  onChange: (type: KvField["type"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = typeOptions.find((o) => o.value === value)!;

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className={`inline-flex items-center gap-1 h-9 rounded-lg border px-2.5 text-xs font-medium transition-colors ${current.border} ${current.bg} ${current.color}`}
      >
        {current.label}
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[5.5rem] rounded-lg border border-white/[0.08] bg-[#1a1a1a] shadow-xl shadow-black/40 py-1"
            style={{ top: pos.top, left: pos.left }}
          >
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-white/[0.06] ${
                  opt.value === value ? "font-medium" : ""
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      opt.value === "string" ? "#10b981" : opt.value === "number" ? "#3b82f6" : "#f59e0b",
                  }}
                />
                <span className={opt.color}>{opt.label}</span>
                {opt.value === value && (
                  <Check className={`h-3 w-3 ml-auto ${opt.color}`} />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export default function CollectionPage() {
  const { dbId, collectionName } = useParams();
  const queryClient = useQueryClient();

  const [showCreateDoc, setShowCreateDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [fields, setFields] = useState<KvField[]>([{ key: "", value: "", type: "string" }]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: dbMeta, isLoading: isLoadingDb } = useQuery({
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
      apiClient.collection.getDocuments(dbId as string, collectionName as string),
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
      apiClient.collection.createDocument(dbId as string, collectionName as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-documents", dbId, collectionName] });
      queryClient.invalidateQueries({ queryKey: ["collection-count", dbId, collectionName] });
      queryClient.invalidateQueries({ queryKey: ["database-collections", dbId] });
      setShowCreateDoc(false);
      resetFields();
    },
  });

  const updateDocMutation = useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: Record<string, any> }) =>
      apiClient.collection.updateDocument(dbId as string, collectionName as string, documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-documents", dbId, collectionName] });
      setEditingDoc(null);
      resetFields();
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (documentId: string) =>
      apiClient.collection.deleteDocument(dbId as string, collectionName as string, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-documents", dbId, collectionName] });
      queryClient.invalidateQueries({ queryKey: ["collection-count", dbId, collectionName] });
      setDeleteTarget(null);
    },
  });

  const resetFields = () => {
    setFields([{ key: "", value: "", type: "string" }]);
    setFieldError(null);
  };

  const updateField = (index: number, patch: Partial<KvField>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
    setFieldError(null);
  };

  const addField = () => {
    setFields((prev) => [...prev, { key: "", value: "", type: "string" }]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDoc = () => {
    const nonEmpty = fields.filter((f) => f.key.trim());
    if (nonEmpty.length === 0) {
      setFieldError("Add at least one field");
      return;
    }

    const keys = nonEmpty.map((f) => f.key.trim());
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length > 0) {
      setFieldError(`Duplicate key: "${dupes[0]}"`);
      return;
    }

    setFieldError(null);
    const doc = fieldsToDoc(nonEmpty);

    if (editingDoc) {
      updateDocMutation.mutate({ documentId: editingDoc._id, data: doc });
    } else {
      createDocMutation.mutate(doc);
    }
  };

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (doc: any) => {
    setEditingDoc(doc);
    const parsed = docToFields(doc);
    setFields(parsed.length > 0 ? parsed : [{ key: "", value: "", type: "string" }]);
    setFieldError(null);
  };

  const openCreate = () => {
    setEditingDoc(null);
    resetFields();
    setShowCreateDoc(true);
  };

  const closeDocModal = () => {
    setShowCreateDoc(false);
    setEditingDoc(null);
    resetFields();
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
            <p className="text-sm text-red-400">{(documentsError as Error).message}</p>
          </div>
        </div>
      </>
    );
  }

  const docCount =
    countData?.count != null
      ? countData.count - (documents || []).filter((d: any) => d._seed).length
      : visibleDocs.length;

  const isPending = createDocMutation.isPending || updateDocMutation.isPending;

  return (
    <>
      <Ttile>
        {collectionName} - {dbMeta?.name || "Database"} - NotDatabase
      </Ttile>
      <div className="p-6 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{collectionName}</h1>
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
                    <span className="text-xs text-gray-500 font-mono truncate">{doc._id}</span>
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
            <Button size="sm" variant="outline" onClick={openCreate} className="rounded-lg gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add document
            </Button>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal open={showCreateDoc || !!editingDoc} onClose={closeDocModal}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">
              {editingDoc ? "Edit document" : "Add document"}
            </h2>
            <button
              onClick={closeDocModal}
              className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {editingDoc
              ? "Modify the fields below. System fields (_id, timestamps) are managed automatically."
              : "Add key-value fields for the new document. An _id will be generated automatically."}
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {fields.map((field, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  value={field.key}
                  onChange={(e) => updateField(i, { key: e.target.value })}
                  placeholder="key"
                  spellCheck={false}
                  className="flex-1 min-w-0 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-mono text-gray-200 focus:outline-none focus:border-white/[0.15] transition-colors placeholder:text-gray-600"
                />
                <input
                  value={field.value}
                  onChange={(e) => updateField(i, { value: e.target.value })}
                  placeholder="value"
                  spellCheck={false}
                  className="flex-[1.5] min-w-0 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-mono text-gray-200 focus:outline-none focus:border-white/[0.15] transition-colors placeholder:text-gray-600"
                />
                <TypeDropdown
                  value={field.type}
                  onChange={(type) => updateField(i, { type })}
                />
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  disabled={fields.length === 1}
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addField}
            className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors py-1"
          >
            <Plus className="h-3 w-3" />
            Add field
          </button>

          {fieldError && <p className="mt-2 text-xs text-red-400">{fieldError}</p>}
          {(createDocMutation.isError || updateDocMutation.isError) && (
            <p className="mt-2 text-xs text-red-400">
              {(createDocMutation.error || updateDocMutation.error)?.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] rounded-b-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDocModal}
            disabled={isPending}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitDoc}
            disabled={isPending}
            className="rounded-lg px-4"
          >
            {isPending ? (
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
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} width="max-w-sm">
        <div className="px-6 pt-6 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Delete document</h2>
          <p className="text-sm text-gray-500 mt-1">
            Are you sure you want to delete this document? This action cannot be undone.
          </p>
          {deleteTarget && (
            <p className="mt-3 text-xs text-gray-600 font-mono truncate">
              ID: {deleteTarget._id}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] rounded-b-xl">
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
      </Modal>
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
