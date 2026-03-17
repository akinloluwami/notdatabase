"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Database,
  Loader2,
  Copy,
  Check,
  Plus,
  LogOut,
  Search,
  ArrowRight,
} from "lucide-react";
import Ttile from "@/components/ttile";
import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [dbName, setDbName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdDatabase, setCreatedDatabase] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const { signOut } = authClient;

  const {
    data: databases,
    isLoading: isDbLoading,
    isError: isDbError,
    error: dbError,
  } = useQuery({
    queryKey: ["databases"],
    queryFn: apiClient.database.list,
  });

  const createDatabaseMutation = useMutation({
    mutationFn: (name: string) => apiClient.database.create(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      setIsModalOpen(false);
      setDbName("");
      setCreatedDatabase(data);
      setIsApiKeyModalOpen(true);
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createDatabaseMutation.mutate(dbName);
  };

  const handleCopyApiKey = async () => {
    if (createdDatabase?.apiKey) {
      await navigator.clipboard.writeText(createdDatabase.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const filteredDatabases = databases?.filter((db: any) =>
    db.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Ttile>Dashboard - NotDatabase</Ttile>
      <div className="min-h-[100dvh]">
        <nav className="border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" className="w-7 h-7" alt="NotDatabase" />
              <span className="font-semibold text-[15px] tracking-tight text-white">
                NotDatabase
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-5 py-10">
          <header className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Databases</h1>
              <Button
                onClick={() => {
                  setIsModalOpen(true);
                  setError(null);
                  setDbName("");
                }}
                className="rounded-lg"
              >
                <Plus className="h-4 w-4" />
                New database
              </Button>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search databases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white/[0.03] border-white/[0.08] focus:border-white/[0.15] rounded-lg"
              />
            </div>
          </header>

          <main>
            {isDbLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : isDbError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-400">
                  {(dbError as Error).message}
                </p>
              </div>
            ) : filteredDatabases && filteredDatabases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDatabases.map((db: any) => (
                  <Link
                    key={db.id}
                    href={`/dashboard/databases/${db.id}`}
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Database className="h-4 w-4 text-gray-400" />
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1" />
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-white/90">
                      {db.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {db.collectionCount || 0} collections
                      <span className="mx-1.5 text-gray-700">&middot;</span>
                      {db.documentCount || 0} documents
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      Open
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : databases && databases.length > 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">
                  No databases match &ldquo;{search}&rdquo;
                </p>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Database className="h-5 w-5 text-gray-500" />
                </div>
                <h3 className="font-medium text-white mb-1">
                  No databases yet
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create your first database to get started.
                </p>
                <Button
                  onClick={() => {
                    setIsModalOpen(true);
                    setError(null);
                    setDbName("");
                  }}
                  className="rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  New database
                </Button>
              </div>
            )}
          </main>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
            <form onSubmit={handleCreateDatabase}>
              <div className="px-6 pt-6 pb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5">
                  <Database className="h-5 w-5 text-gray-400" />
                </div>
                <DialogHeader className="space-y-1 p-0">
                  <DialogTitle className="text-lg">New database</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    This will create a new database and generate an API key.
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <Input
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder="my-database"
                    disabled={createDatabaseMutation.isPending}
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
                  onClick={() => setIsModalOpen(false)}
                  disabled={createDatabaseMutation.isPending}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    !dbName.trim() || createDatabaseMutation.isPending
                  }
                  className="rounded-lg px-4"
                >
                  {createDatabaseMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create database"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Database created</DialogTitle>
              <DialogDescription>
                Your database &ldquo;{createdDatabase?.name}&rdquo; is ready.
                Copy your API key — you won&apos;t see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={createdDatabase?.apiKey || ""}
                  readOnly
                  className="font-mono text-sm bg-white/[0.03] border-white/[0.08]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyApiKey}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-amber-300 text-xs leading-relaxed">
                  Store this key somewhere safe. You can manage API keys later
                  in database settings.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
