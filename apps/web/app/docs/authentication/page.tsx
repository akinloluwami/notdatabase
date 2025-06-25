import React from "react";
import DocsContainer from "../components/ui/docs-container";
import DocsHeading from "../components/ui/docs-heading";
import DocsText from "../components/ui/docs-text";
import DocsCodeBlock from "../components/ui/docs-code-block";
import DocsCallout from "../components/ui/docs-callout";

const Authentication = () => {
  return (
    <DocsContainer>
      <DocsHeading level={1}>Authentication</DocsHeading>
      <DocsText>
        All requests to NotDatabase are scoped to a specific database. You
        authenticate with an API key tied to that database.
      </DocsText>
      <DocsCallout type="warning">
        <DocsText className="mb-0">
          <strong>Keep your API keys secret!</strong> Never expose them in
          client-side code or public repositories.
        </DocsText>
      </DocsCallout>
      <DocsHeading level={2}>Getting your API key</DocsHeading>
      <DocsText>
        You can generate and manage API keys from your NotDatabase dashboard. Go
        to <strong>Dashboard &gt; Databases &gt; API Keys</strong> to create a
        new key or view existing ones.
      </DocsText>
      <DocsHeading level={2}>Using your API key in the SDK</DocsHeading>
      <DocsText>
        Pass your API key to the SDK when creating your client:
      </DocsText>
      <DocsCodeBlock>{`const db = createClient({
  apiKey: "your_api_key",
  schema: { /* ... */ },
});`}</DocsCodeBlock>
      <DocsText>
        All requests made with this client will be authenticated using your API
        key.
      </DocsText>
    </DocsContainer>
  );
};

export default Authentication;
