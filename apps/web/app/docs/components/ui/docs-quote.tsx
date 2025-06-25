import React from "react";

export type DocsQuoteProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsQuote = ({ children, className = "" }: DocsQuoteProps) => (
  <blockquote
    className={`border-l-4 border-gray-400 bg-gray-900/40 italic p-4 my-4 rounded text-gray-200 ${className}`}
  >
    {children}
  </blockquote>
);

export default DocsQuote;
