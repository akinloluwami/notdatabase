import React from "react";

const DocsText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`text-base text-gray-300 leading-relaxed mb-4 ${className}`}>
    {children}
  </p>
);

export default DocsText;
