import React from "react";

type DocsListProps = {
  children: React.ReactNode;
  ordered?: boolean;
  className?: string;
};

const DocsList = ({
  children,
  ordered = false,
  className = "",
}: DocsListProps) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`pl-6 mb-4 space-y-2 list-disc ${ordered ? "list-decimal" : "list-disc"} ${className}`}
    >
      {children}
    </Tag>
  );
};

export default DocsList;
