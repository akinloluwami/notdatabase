import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsCallout from "../components/ui/docs-callout";

const Installation = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Installation</DocsHeading>
      <DocsText>
        Get started with NotDatabase by installing the SDK in your project. You
        can use npm, pnpm, or yarn.
      </DocsText>
      <DocsCallout type="info">
        <DocsText className="mb-0">
          <strong>🧪 TypeScript Required:</strong> NotDatabase is designed for
          TypeScript. It leverages your schema to generate fully typed methods —
          no extra tools or config needed.
        </DocsText>
      </DocsCallout>
      <DocsHeading level={3}>Install with npm</DocsHeading>
      <DocsCodeBlock>{`npm install notdb`}</DocsCodeBlock>
      <DocsHeading level={3}>Install with pnpm</DocsHeading>
      <DocsCodeBlock>{`pnpm add notdb`}</DocsCodeBlock>
      <DocsHeading level={3}>Install with yarn</DocsHeading>
      <DocsCodeBlock>{`yarn add notdb`}</DocsCodeBlock>
    </DocsContainer>
  );
};

export default Installation;
