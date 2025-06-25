import React from "react";

export type DocsHighlightProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsHighlight = ({ children, className = "" }: DocsHighlightProps) => (
  <mark
    className={`bg-white/5 italic text-gray-400 text-sm px-1 py-0.5 rounded font-semibold ${className}`}
  >
    {children}
  </mark>
);

export default DocsHighlight;
