import Link from "next/link";
import React from "react";

type Crumb = { label: string; href?: string };

type DocsBreadcrumbsProps = {
  crumbs: Crumb[];
  className?: string;
};

const DocsBreadcrumbs = ({ crumbs, className = "" }: DocsBreadcrumbsProps) => (
  <nav
    className={`text-xs text-gray-400 mb-4 ${className}`}
    aria-label="Breadcrumb"
  >
    <ol className="flex items-center space-x-2">
      {crumbs.map((crumb, idx) => (
        <li key={idx} className="flex items-center">
          {crumb.href ? (
            <Link href={crumb.href} className="hover:underline text-blue-400">
              {crumb.label}
            </Link>
          ) : (
            <span>{crumb.label}</span>
          )}
          {idx < crumbs.length - 1 && <span className="mx-2">/</span>}
        </li>
      ))}
    </ol>
  </nav>
);

export default DocsBreadcrumbs;
