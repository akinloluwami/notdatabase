import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsList from "../components/ui/docs-list";

const Update = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Update</DocsHeading>
      <DocsText>
        Use <code>update()</code> to modify an existing document by its ID. Only
        the fields you pass will be updated — the rest stay untouched.
      </DocsText>

      <DocsHeading level={2}>
        ✏️ <code>update()</code>
      </DocsHeading>
      <DocsCodeBlock>{`await db.users.update("user_gilfoyle", {
  name: "Bertram Gilfoyle",
  isAdmin: true,
});`}</DocsCodeBlock>
      <DocsText>
        This updates just the <code>name</code> and <code>isAdmin</code> fields
        of the document with <code>_id: "user_gilfoyle"</code>.
      </DocsText>

      <DocsHeading level={2}>Behavior</DocsHeading>
      <DocsList>
        <li>
          <strong>Partial update:</strong> You don't need to pass all fields.
        </li>
        <li>
          <strong>Schema validated:</strong> The new fields are still validated
          against the schema.
        </li>
        <li>
          <strong>
            <code>updatedAt</code> is automatically updated
          </strong>{" "}
          for you.
        </li>
      </DocsList>
    </DocsContainer>
  );
};

export default Update;
