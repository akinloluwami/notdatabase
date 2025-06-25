import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

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
}: DocsCodeBlockProps) => (
  <div className="border rounded-2xl my-4">
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

export default DocsCodeBlock;
