"use client";

import {
  ArrowDownToLine,
  Box,
  Component,
  Database,
  FileBox,
  Group,
  Key,
  PackageOpen,
  PackagePlus,
  Play,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const pages = [
    {
      group: "Getting Started",
      items: [
        { name: "What is NotDatabase?", href: "/docs", icon: Play },
        { name: "How it works", href: "/docs/how-it-works", icon: Box },
      ],
    },
    {
      group: "SDK",
      items: [
        {
          name: "Installation",
          href: "/docs/installation",
          icon: ArrowDownToLine,
        },
        { name: "Authentication", href: "/docs/authentication", icon: Key },
      ],
    },
    {
      group: "Core Concepts",
      items: [
        { name: "Databases", href: "/docs/databases", icon: Database },
        { name: "Collections", href: "/docs/collections", icon: Component },
        { name: "Documents", href: "/docs/documents", icon: FileBox },
      ],
    },
    {
      group: "Database Functions",
      items: [
        { name: "Create", href: "/docs/create", icon: PackagePlus },
        { name: "Read", href: "/docs/read", icon: PackageOpen },
        { name: "Update", href: "/docs/update", icon: FileBox },
        { name: "Delete", href: "/docs/delete", icon: Trash },
        { name: "Aggregation", href: "/docs/aggregation", icon: Group },
      ],
    },
  ];

  const pathname = usePathname();

  return (
    <div className="w-64 fixed top-20 h-full hidden md:block">
      <div className="space-y-4 w-full">
        {pages.map((page) => (
          <div key={page.group} className="w-full">
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
              {page.group}
            </h3>
            <div className="w-full flex flex-col">
              {page.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${pathname === item.href ? "bg-white text-black" : "hover:bg-white/5"} w-full h-10 rounded-2xl flex items-center px-3 font-medium text-sm gap-x-2`}
                >
                  <item.icon size={14} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
