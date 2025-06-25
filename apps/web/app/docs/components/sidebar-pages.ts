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

export const pages = [
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
