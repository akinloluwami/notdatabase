"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

type DocsCodeBlockProps = {
  children: string;
  className?: string;
  language?: string;
  styleOverride?: object;
};

const DocsCodeBlock = ({
  children,
  language = "typescript",
  styleOverride = {},
}: DocsCodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="relative border rounded-2xl my-4">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={dracula}
        customStyle={{
          background: "none",
          fontSize: "0.875rem",
          color: "#f8f8f2",
          ...styleOverride,
        }}
        wrapLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default DocsCodeBlock;
