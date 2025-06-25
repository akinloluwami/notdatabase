import React from "react";
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

const DocsContainer = ({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath?: string;
}) => {
  const { prev, next } = getPrevNext(currentPath!);
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
