"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import Sidebar from "./components/sidebar";
import { Menu } from "lucide-react";
import MobileDrawer from "./components/ui/mobile-drawer";
import DocsContainer from "./components/ui/docs-container";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex justify-between mx-auto py-4 sticky top-0 backdrop-blur z-10">
        <div className="flex items-center gap-1">
          <button
            className="md:hidden p-2 rounded hover:bg-white/10 focus:outline-none"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={22} />
          </button>
          <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" className="w-6" />
            <p className="font-semibold">NotDatabase</p>
          </Link>
          <p className="text-gray-500">Docs</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Link
            href="https://github.com/akinloluwami/notdatabase"
            className="p-1 hover:bg-white/10 rounded-sm transition-colors"
            target="_blank"
          >
            <SiGithub size={20} />
          </Link>
        </div>
      </div>
      <div className="flex lg:ap-x-10">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
