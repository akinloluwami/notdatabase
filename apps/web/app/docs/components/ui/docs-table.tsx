import React from "react";

type DocsTableProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsTable = ({ children, className = "" }: DocsTableProps) => (
  <div className="overflow-x-auto mb-4">
    <table className={`min-w-full border border-gray-700 rounded ${className}`}>
      {children}
    </table>
  </div>
);

export default DocsTable;
