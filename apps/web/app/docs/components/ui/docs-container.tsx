"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pages } from "../sidebar-pages";
import DocsLink from "./docs-link";

function flattenPages() {
  return pages.flatMap((group) => group.items);
}

function getPrevNext(currentPath: string) {
  const flat = flattenPages();
  const idx = flat.findIndex((p) => p.href === currentPath);
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}

function getCurrentPageTitle(currentPath: string) {
  const flat = flattenPages();
  const page = flat.find((p) => p.href === currentPath);
  return page ? page.name : "Docs";
}

const DocsContainer = ({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) => {
  const pathname = currentPath ?? usePathname();
  const { prev, next } = getPrevNext(pathname);
  const pageTitle = getCurrentPageTitle(pathname);

  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle + " | Docs";
    }
  }, [pageTitle]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full lg:ml-80">
      {children}
      <div className="flex justify-between mt-12">
        {prev ? (
          <DocsLink href={prev.href}>&larr; {prev.name}</DocsLink>
        ) : (
          <span />
        )}
        {next ? (
          <DocsLink href={next.href}>{next.name} &rarr;</DocsLink>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

export default DocsContainer;
export { getPrevNext };
