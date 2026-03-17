"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/lib/api-client";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, Loader2, ChevronLeft, Plus } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Key01Icon,
  Settings03Icon,
  DatabaseIcon,
} from "@hugeicons/core-free-icons";

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dbId } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

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

  const createCollectionMutation = useMutation({
    mutationFn: (name: string) =>
      apiClient.collection.create(dbId as string, name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["database-collections", dbId],
      });
      setShowCreateCollection(false);
      setNewCollectionName("");
      router.push(
        `/dashboard/databases/${dbId}/collections/${data.name}`,
      );
    },
  });

  if (isLoading || isLoadingCollections)
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );

  if (isError || isErrorCollections)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 max-w-md">
          <p className="text-sm text-red-400">
            {((error || collectionsError) as Error).message}
          </p>
        </div>
      </div>
    );

  const handleDatabaseChange = (selectedDbId: string) => {
    router.push(`/dashboard/databases/${selectedDbId}`);
  };

  const navItems = [
    {
      label: "Overview",
      href: `/dashboard/databases/${dbId}`,
      icon: DashboardSquare01Icon,
      active: pathname === `/dashboard/databases/${dbId}`,
    },
    {
      label: "API Keys",
      href: `/dashboard/databases/${dbId}/api-keys`,
      icon: Key01Icon,
      active: pathname === `/dashboard/databases/${dbId}/api-keys`,
    },
    {
      label: "Settings",
      href: `/dashboard/databases/${dbId}/settings`,
      icon: Settings03Icon,
      active: pathname === `/dashboard/databases/${dbId}/settings`,
    },
  ];

  return (
    <div className="min-h-[100dvh] flex">
      <aside className="w-60 shrink-0 border-r border-white/[0.06] flex flex-col sticky top-0 h-[100dvh] overflow-y-auto">
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Databases
          </Link>
          <Select value={dbId as string} onValueChange={handleDatabaseChange}>
            <SelectTrigger className="w-full border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-left font-medium text-sm h-9 rounded-lg">
              <SelectValue placeholder="Select database" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingDatabases ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : (
                databases?.map((db: { id: string; name: string }) => (
                  <SelectItem key={db.id} value={db.id}>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={DatabaseIcon} size={14} />
                      {db.name}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex-1 px-3 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.active
                    ? "bg-white/[0.08] text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={16}
                  className="shrink-0"
                />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Collections
                </span>
              </div>
              <button
                onClick={() => setShowCreateCollection(true)}
                className="p-0.5 rounded text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {collections && collections.length > 0 ? (
              <div className="space-y-0.5">
                {collections.map((col: string) => {
                  const colPath = `/dashboard/databases/${dbId}/collections/${col}`;
                  const isActive = pathname === colPath;
                  return (
                    <Link
                      key={col}
                      href={colPath}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-white/[0.08] text-white font-medium"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {col}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="px-3 text-xs text-gray-600">No collections</p>
            )}
          </div>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>

      <Dialog
        open={showCreateCollection}
        onOpenChange={(open) => {
          setShowCreateCollection(open);
          if (!open) setNewCollectionName("");
        }}
      >
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCollectionName.trim()) {
                createCollectionMutation.mutate(newCollectionName.trim());
              }
            }}
          >
            <div className="px-6 pt-6 pb-4">
              <DialogHeader className="space-y-1 p-0">
                <DialogTitle className="text-lg">
                  Create collection
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Collections organize your documents. Use letters, numbers,
                  hyphens, or underscores.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5">
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. users, posts, products"
                  className="bg-white/[0.03] border-white/[0.08] focus:border-white/[0.15] h-10"
                  autoFocus
                />
                {createCollectionMutation.isError && (
                  <p className="mt-2 text-xs text-red-400">
                    {createCollectionMutation.error.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateCollection(false)}
                disabled={createCollectionMutation.isPending}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  !newCollectionName.trim() ||
                  createCollectionMutation.isPending
                }
                className="rounded-lg px-4"
              >
                {createCollectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
