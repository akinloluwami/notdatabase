import React from "react";

type DocsHeadingProps = {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

const headingStyles: { [key: string]: string } = {
  "1": "text-3xl font-bold mb-6",
  "2": "text-2xl font-semibold mb-4",
  "3": "text-xl font-semibold mb-3",
  "4": "text-lg font-medium mb-2",
  "5": "text-base font-medium mb-1",
  "6": "text-sm font-medium mb-1",
};

const DocsHeading = ({
  children,
  level = 1,
  className = "",
}: DocsHeadingProps) => {
  const safeLevel = Math.min(6, Math.max(1, level));
  const Tag = `h${safeLevel}`;
  return React.createElement(
    Tag,
    { className: `${headingStyles[String(safeLevel)]} ${className}` },
    children
  );
};

export default DocsHeading;
