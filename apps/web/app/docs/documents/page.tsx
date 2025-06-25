import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsList from "../components/ui/docs-list";

const Documents = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Documents</DocsHeading>
      <DocsText>
        A <strong>document</strong> is a single unit of data inside a collection
        — like a row in SQL or an object in a JSON array.
      </DocsText>
      <DocsText>
        In NotDatabase, documents are just structured key-value objects that
        follow your collection's schema.
      </DocsText>

      <DocsHeading level={2}>✍️ Inserting Documents</DocsHeading>
      <DocsText>
        Use the <code>.insert()</code> method to add a new document to a
        collection:
      </DocsText>
      <DocsCodeBlock>{`await db.users.insert({
  name: "Jian-Yang",
  email: "jianyang@piedpiper.com",
});`}</DocsCodeBlock>

      <DocsHeading level={2}>📄 What a Document Looks Like</DocsHeading>
      <DocsText>Every document automatically includes:</DocsText>
      <DocsList>
        <li>
          <code>_id</code>: A unique identifier (you can override with{" "}
          <code>key</code>)
        </li>
        <li>
          <code>createdAt</code>: Timestamp of when the doc was created
        </li>
        <li>
          <code>updatedAt</code>: Timestamp of last update
        </li>
      </DocsList>
      <DocsText>Example:</DocsText>
      <DocsCodeBlock>{`{
  "_id": "abc123",
  "name": "Jian-Yang",
  "email": "jianyang@piedpiper.com",
  "createdAt": "2025-06-19T12:00:00Z",
  "updatedAt": "2025-06-19T12:00:00Z"
}`}</DocsCodeBlock>
    </DocsContainer>
  );
};

export default Documents;
