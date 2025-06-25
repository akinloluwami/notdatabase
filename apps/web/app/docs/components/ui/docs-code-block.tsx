import React from "react";

type DocsCodeBlockProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsCodeBlock = ({ children, className = "" }: DocsCodeBlockProps) => (
  <pre
    className={`bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto mb-4 ${className}`}
  >
    <code>{children}</code>
  </pre>
);

export default DocsCodeBlock;
