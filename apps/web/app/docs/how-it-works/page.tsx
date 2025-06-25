import React from "react";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsList from "../components/ui/docs-list";
import DocsCodeBlock from "../components/ui/docs-code-block";

const HowItWorks = () => {
  return (
    <div>
      <DocsHeading level={1}>How it works</DocsHeading>
      <DocsText>
        NotDatabase is designed to simplify data management for developers by
        providing a flexible, document-oriented database platform. Here's a
        high-level overview of how it works:
      </DocsText>

      <DocsHeading level={2} className="mt-8">
        Architecture
      </DocsHeading>
      <DocsText>
        NotDatabase uses a modern, distributed architecture that allows you to:
      </DocsText>
      <DocsList>
        <li>Define databases and collections for your application data.</li>
        <li>
          Store documents (JSON objects) in collections, with flexible schemas.
        </li>
        <li>
          Query, aggregate, and manipulate data using a simple API or SDK.
        </li>
        <li>
          Integrate authentication and access control for secure data
          operations.
        </li>
      </DocsList>

      <DocsHeading level={2} className="mt-8">
        Developer Workflow
      </DocsHeading>
      <DocsList ordered>
        <li>
          <strong>Install the SDK:</strong> Add NotDatabase to your project
          using npm, yarn, or pnpm.
        </li>
        <li>
          <strong>Authenticate:</strong> Connect to your NotDatabase instance
          using your API key.
        </li>
        <li>
          <strong>Define Collections:</strong> Create collections to organize
          your data.
        </li>
        <li>
          <strong>Store & Query Data:</strong> Insert, update, and retrieve
          documents using the SDK or HTTP API.
        </li>
        <li>
          <strong>Aggregate & Analyze:</strong> Use built-in aggregation
          functions to analyze your data.
        </li>
      </DocsList>

      <DocsHeading level={2} className="mt-8">
        Example: Inserting a Document
      </DocsHeading>
      <DocsCodeBlock>
        {`import { NotDatabase } from "notdb-js";

const db = new NotDatabase({ apiKey: "YOUR_API_KEY" });

await db.collection("users").insert({
  name: "Ada Lovelace",
  email: "ada@example.com",
});`}
      </DocsCodeBlock>
    </div>
  );
};

export default HowItWorks;
