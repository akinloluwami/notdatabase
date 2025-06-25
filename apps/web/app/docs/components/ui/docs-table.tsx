"use client";

import React from "react";

type DocsTableProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsTable = ({ children, className = "" }: DocsTableProps) => (
  <div className="overflow-x-auto mb-4">
    <table
      className={`min-w-full border-separate border-spacing-0 rounded-lg border border-gray-200/5 ${className}`}
    >
      {children}
    </table>
  </div>
);

export default DocsTable;
