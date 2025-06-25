import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsTable from "../components/ui/docs-table";
import DocsCallout from "../components/ui/docs-callout";

const Read = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Read</DocsHeading>
      <DocsText>
        You can read data using <code>find()</code> to fetch multiple documents,
        and <code>get()</code> to fetch a single document by ID.
      </DocsText>

      <DocsHeading level={2}>
        🔹 <code>find()</code>
      </DocsHeading>
      <DocsText>
        Use this to query a collection and retrieve multiple documents.
      </DocsText>
      <DocsCodeBlock>{`const users = await db.users.find({
  filter: { isAdmin: true },
  sort: "-createdAt",
  limit: 10,
});`}</DocsCodeBlock>
      <DocsHeading level={3}>Options</DocsHeading>
      <DocsTable>
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>filter</code>
            </td>
            <td>
              <code>Partial&lt;Schema&gt;</code>
            </td>
            <td>Filters by matching fields</td>
          </tr>
          <tr>
            <td>
              <code>sort</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              Sort by a field (use <code>-</code> prefix for descending)
            </td>
          </tr>
          <tr>
            <td>
              <code>limit</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>Max number of results to return</td>
          </tr>
          <tr>
            <td>
              <code>offset</code>
            </td>
            <td>
              <code>number</code>
            </td>
            <td>Skips N number of results (for pagination)</td>
          </tr>
        </tbody>
      </DocsTable>

      <DocsHeading level={2}>
        🔸 <code>get()</code>
      </DocsHeading>
      <DocsText>Use this to fetch a single document by its ID.</DocsText>
      <DocsCodeBlock>{`const user = await db.users.get("user_abc123");`}</DocsCodeBlock>
      <DocsText>You can also select specific fields:</DocsText>
      <DocsCodeBlock>{`const user = await db.users.get("user_abc123", {
  select: { name: true, email: true },
});`}</DocsCodeBlock>
      <DocsCallout type="info">
        <DocsText className="mb-0">
          <code>_id</code>, <code>createdAt</code>, and <code>updatedAt</code>{" "}
          are always returned by default — even if not selected.
        </DocsText>
      </DocsCallout>
    </DocsContainer>
  );
};

export default Read;
