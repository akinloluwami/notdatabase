import React from "react";

type DocsCalloutProps = {
  children: React.ReactNode;
  type?: "info" | "warning" | "success";
  className?: string;
};

const typeStyles = {
  info: "border-blue-400 bg-blue-950/40",
  warning: "border-yellow-400 bg-yellow-950/40",
  success: "border-green-400 bg-green-950/40",
};

const DocsCallout = ({
  children,
  type = "info",
  className = "",
}: DocsCalloutProps) => (
  <div
    className={`border-l-4 p-4 my-4 rounded ${typeStyles[type]} ${className}`}
  >
    {children}
  </div>
);

export default DocsCallout;
