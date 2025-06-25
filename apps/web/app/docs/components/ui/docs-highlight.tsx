import React from "react";

export type DocsHighlightProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsHighlight = ({ children, className = "" }: DocsHighlightProps) => (
  <mark
    className={`bg-yellow-300/20 text-yellow-200 px-1 py-0.5 rounded font-semibold ${className}`}
  >
    {children}
  </mark>
);

export default DocsHighlight;
