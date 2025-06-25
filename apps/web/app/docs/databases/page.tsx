import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsCallout from "../components/ui/docs-callout";
import DocsLink from "../components/ui/docs-link";
import DocsList from "../components/ui/docs-list";

const Databases = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Databases</DocsHeading>
      <DocsText>
        A <strong>database</strong> in NotDatabase is the root container for all
        your data. Every collection, document, and schema you define lives
        inside a single database.
      </DocsText>
      <DocsText>
        You can create one database and define multiple{" "}
        <strong>collections</strong> inside it, like this:
      </DocsText>
      <DocsCodeBlock>{` import { createClient } from "notdb";
      
const db = createClient({
  apiKey: "your_api_key",
  schema: {
    users: {
      properties: {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
      },
    },
    companies: {
      properties: {
        name: { type: "string", required: true },
        ceo: { type: "string" },
      },
    },
  },
});`}</DocsCodeBlock>
      <DocsText>
        Here, <strong>users</strong> and <strong>companies</strong> are both
        collections inside the same database.
      </DocsText>

      <DocsHeading level={2}>🔒 Scoped by API Key</DocsHeading>
      <DocsText>
        Your database is identified by your <strong>API key</strong>. That
        means:
      </DocsText>
      <DocsList>
        <li>Everything is isolated to your key</li>
        <li>Multiple apps can use their own keys</li>
      </DocsList>
    </DocsContainer>
  );
};

export default Databases;
