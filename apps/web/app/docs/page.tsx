import React from "react";
import DocsHeading from "./components/ui/docs-heading";
import DocsText from "./components/ui/docs-text";
import DocsCard from "./components/ui/docs-card";
import DocsLink from "./components/ui/docs-link";
import DocsList from "./components/ui/docs-list";
import DocsQuote from "./components/ui/docs-quote";
import DocsHighlight from "./components/ui/docs-highlight";

const sections = [
  {
    group: "Getting Started",
    items: [
      { name: "What is NotDatabase?", href: "/docs" },
      { name: "How it works", href: "/docs/how-it-works" },
    ],
  },
  {
    group: "SDK",
    items: [
      { name: "Installation", href: "/docs/installation" },
      { name: "Authentication", href: "/docs/authentication" },
    ],
  },
  {
    group: "Core Concepts",
    items: [
      { name: "Databases", href: "/docs/databases" },
      { name: "Collections", href: "/docs/collections" },
      { name: "Documents", href: "/docs/documents" },
    ],
  },
  {
    group: "Database Functions",
    items: [
      { name: "Create", href: "/docs/create" },
      { name: "Read", href: "/docs/read" },
      { name: "Update", href: "/docs/update" },
      { name: "Delete", href: "/docs/delete" },
      { name: "Aggregation", href: "/docs/aggregation" },
    ],
  },
];

const Docs = () => {
  return (
    <div>
      <DocsHeading level={1}>What is NotDatabase?</DocsHeading>
      <DocsText>
        NotDatabase is a schema-based key-value database built for developers
        who want structure without the bloat. <br /> <br /> Unlike traditional
        databases that require complex migrations, query languages, or rigid
        schemas, NotDatabase offers a simpler way: define your data model once,
        and it handles validation, constraints, and storage behind the scenes.{" "}
        <br /> <br />
        It stores data as JSON documents under collections, with optional schema
        validation for each one. Every document automatically includes metadata
        like <DocsHighlight>_id</DocsHighlight>,{" "}
        <DocsHighlight>createdAt</DocsHighlight>, and{" "}
        <DocsHighlight>updatedAt</DocsHighlight>. <br /> <br />{" "}
        <b>
          Think of it like Firestore, but with full TypeScript type safety and
          better DX.
        </b>
      </DocsText>

      <DocsHeading level={2} className="mt-8">
        Why it exists
      </DocsHeading>

      <DocsText>
        Databases can become unnecessarily complicated for projects. <br />{" "}
        You're either:
      </DocsText>

      <DocsList>
        <li>fighting with SQL schemas and migration tools, or</li>
        <li>writing spaghetti validation code in NoSQL environments.</li>
      </DocsList>

      <DocsText>
        NotDatabase was built because developers deserve something lightweight
        but structured. A tool that feels native in TypeScript. One that doesn’t
        ask you to choose between structure and flexibility.
      </DocsText>

      <DocsQuote>
        You define your schema in TS, and everything just works — type-safe SDK,
        server validation, and simple APIs.
      </DocsQuote>

      <DocsText>It's for:</DocsText>

      <DocsList>
        <li>MVPs and side projects</li>
        <li>Event logs, audit trails, feedback systems</li>
        <li>Internal dashboards</li>
        <li>Anyone tired of fighting with “real” databases for small apps</li>
      </DocsList>
    </div>
  );
};

export default Docs;
