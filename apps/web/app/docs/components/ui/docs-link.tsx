import Link from "next/link";
import React from "react";

type DocsLinkProps = React.ComponentProps<typeof Link> & {
  children: React.ReactNode;
  className?: string;
};

const DocsLink = ({ children, className = "", ...props }: DocsLinkProps) => (
  <Link
    {...props}
    className={`text-sm text-gray-400 underline hover:text-white transition-colors ${className}`}
  >
    {children}
  </Link>
);

export default DocsLink;
