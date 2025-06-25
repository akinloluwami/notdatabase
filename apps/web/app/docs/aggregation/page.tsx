import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsList from "../components/ui/docs-list";
import DocsCallout from "../components/ui/docs-callout";

const Aggregation = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Aggregation</DocsHeading>
      <DocsText>
        NotDatabase supports basic aggregation via the <code>count()</code>{" "}
        function — useful for stats, metrics, and simple dashboards.
      </DocsText>

      <DocsHeading level={2}>
        🔢 <code>count()</code>
      </DocsHeading>
      <DocsText>Returns the number of documents in a collection.</DocsText>
      <DocsCodeBlock>{`const total = await db.users.count();`}</DocsCodeBlock>

      <DocsHeading level={3}>With Filters</DocsHeading>
      <DocsText>
        You can apply filters to count only documents matching certain criteria:
      </DocsText>
      <DocsCodeBlock>{`const admins = await db.users.count({
  filter: {
    isAdmin: true,
  },
});`}</DocsCodeBlock>

      <DocsHeading level={2}>Use Cases</DocsHeading>
      <DocsList>
        <li>Dashboard metrics</li>
        <li>Pagination setup</li>
        <li>Quick summaries</li>
        <li>Lightweight analytics</li>
      </DocsList>
      <DocsCallout type="info">
        <DocsText className="mb-0">
          More aggregation functions (like <code>sum</code>, <code>avg</code>,
          etc.) will be added in the future.
        </DocsText>
      </DocsCallout>
    </DocsContainer>
  );
};

export default Aggregation;
