import React from "react";

type DocsCardProps = {
  children: React.ReactNode;
  className?: string;
};

const DocsCard = ({ children, className = "" }: DocsCardProps) => (
  <div
    className={`bg-black/5 border border-gray-200/5 rounded-lg p-6 mb-4 ${className}`}
  >
    {children}
  </div>
);

export default DocsCard;
