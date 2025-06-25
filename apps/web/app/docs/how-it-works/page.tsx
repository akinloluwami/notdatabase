import React from "react";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsList from "../components/ui/docs-list";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsQuote from "../components/ui/docs-quote";
import DocsContainer from "../components/ui/docs-container";
import DocsCallout from "../components/ui/docs-callout";
import DocsHighlight from "../components/ui/docs-highlight";

const HowItWorks = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>How it works</DocsHeading>
      <DocsText>NotDatabase is built on one simple idea:</DocsText>
      <DocsQuote>
        Store JSON documents under collections, with optional schema enforcement
        — and wrap it all with a fully type-safe SDK.
      </DocsQuote>
      <DocsText>Here's what actually happens under the hood:</DocsText>

      <DocsHeading level={2}>1. You define your schema</DocsHeading>
      <DocsText className="mb-2">In your SDK config:</DocsText>
      <DocsCodeBlock>{`const db = createClient({
  apiKey: "your_api_key", // optional for temp DBs
  schema: {
    users: {
      properties: {
        name: { type: "string", required: true },
        email: { type: "string", required: true, unique: true },
        age: { type: "number" },
        isAdmin: { type: "boolean", default: false },
      },
    },
  },
});`}</DocsCodeBlock>

      <DocsHeading level={2}>2. You insert documents</DocsHeading>
      <DocsText className="mb-2">
        Insert a document into your collection:
      </DocsText>
      <DocsCodeBlock>{`await db.users.insert({
  name: "Bug",
  email: "bug@notdb.io",
  age: 19,
});`}</DocsCodeBlock>
      <DocsText className="mb-2">The SDK:</DocsText>
      <DocsList>
        <li>
          Applies default values (like <DocsHighlight>isAdmin</DocsHighlight>)
        </li>
        <li>
          Adds metadata (<DocsHighlight>_id</DocsHighlight>,{" "}
          <DocsHighlight>createdAt</DocsHighlight>,{" "}
          <DocsHighlight>updatedAt</DocsHighlight>)
        </li>
        <li>Sends it to the API</li>
      </DocsList>
      <DocsText className="mb-2">The API:</DocsText>
      <DocsList>
        <li>Validates it against the schema you defined</li>
        <li>Checks for required & unique fields</li>
        <li>Stores it in the database</li>
      </DocsList>

      <DocsHeading level={2}>3. You query like this</DocsHeading>
      <DocsCodeBlock>{`const admins = await db.users.findMany({
  filter: { isAdmin: true },
  sort: "-createdAt",
  limit: 10,
});`}</DocsCodeBlock>
      <DocsText>
        No SQL needed. No learning curve. You just use JavaScript/TypeScript.
      </DocsText>

      <DocsHeading level={2}>
        4. You can update, delete, and count too
      </DocsHeading>
      <DocsCodeBlock>{`await db.users.update("abc123", { age: 20 });
await db.users.delete("abc123");
const count = await db.users.count();`}</DocsCodeBlock>

      <DocsHeading level={2}>
        5. Everything is stored as structured JSON
      </DocsHeading>
      <DocsText>
        Data is saved in a key-value store, but the schema you define gives it
        shape and guarantees — both on the client and the server.
      </DocsText>

      <DocsCallout type="info">
        <DocsText className="mb-0">
          No migrations. No extra tooling. No ORM acrobatics.
        </DocsText>
      </DocsCallout>
    </DocsContainer>
  );
};

export default HowItWorks;
