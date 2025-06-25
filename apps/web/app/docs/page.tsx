import React from "react";
import DocsHeading from "./components/ui/docs-heading";
import DocsText from "./components/ui/docs-text";
import DocsCard from "./components/ui/docs-card";
import DocsLink from "./components/ui/docs-link";

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
        NotDatabase is a modern, flexible, and developer-friendly database
        platform designed to make data storage, retrieval, and management simple
        and efficient. Explore the docs to learn how to get started, use the
        SDK, and master core concepts and database functions.
      </DocsText>

      <DocsHeading level={2} className="mt-8">
        Why it exists
      </DocsHeading>

      <DocsText>
        NotDatabase was created to address the complexities and limitations of
        traditional databases. It aims to provide a more intuitive and flexible
        approach to data management, allowing developers to focus on building
        applications without getting bogged down by database intricacies.
      </DocsText>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {sections.map((section) => (
          <DocsCard key={section.group}>
            <DocsHeading level={3} className="mb-2">
              {section.group}
            </DocsHeading>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <DocsLink href={item.href}>{item.name}</DocsLink>
                </li>
              ))}
            </ul>
          </DocsCard>
        ))}
      </div>
    </div>
  );
};

export default Docs;
