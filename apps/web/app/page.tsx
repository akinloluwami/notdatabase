"use client";

import Link from "next/link";
import Ttile from "@/components/ttile";
import { SiGithub, SiX } from "react-icons/si";
import { SiTypescript } from "react-icons/si";
import Cube3D from "@/components/cube-3d";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentYear, setCurrentYear] = useState("2025");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const crud = [
    {
      title: "Create",
      code: `//Insert single
db.users.insert({
      email: "johndoe@example.com",
      name: "John Doe",
  })

//Insert multiple
db.users.insertBulk([
  {
email:"user@example.com",
name: "User One",
  },
  {
  email:"user2@example.com",
  name: "User Two",
  },
])
  `,
    },
    {
      title: "Read",
      code: `const user = db.users.find("user123")`,
    },
    {
      title: "Update",
      code: `db.users.update("user123", { name: "Jane Doe" })`,
    },
    {
      title: "Delete",
      code: `db.users.delete("user123")`,
    },
    {
      title: "Aggregate",
      code: `const count = db.users.count()      

//More aggregation functions coming soon!
      `,
    },
  ];

  return (
    <>
      <Ttile>NotDatabase</Ttile>

      {/* Header */}
      <div className="flex justify-between max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-1">
          <img
            src="https://api.iconify.design/solar:box-minimalistic-bold-duotone.svg?color=%23888888"
            className="w-6"
          />
          <p className="font-semibold">NotDatabase</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Link href="/docs" className="hover:text-white">
            Documentation
          </Link>
          <span className="mx-2">|</span>
          <>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
            <Link href="/signup" className="hover:text-white">
              Signup
            </Link>
          </>
          <span className="mx-2">|</span>
          <Link
            href="https://github.com/akinloluwami/notdatabase"
            className="p-1 hover:bg-white/10 rounded-sm transition-colors"
            target="_blank"
          >
            <SiGithub size={20} />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="p-5">
        <div className="max-w-7xl mx-auto py-8 border border-gray-200/5 rounded-2xl flex justify-center items-center relative">
          <div
            className="overflow-hidden"
            style={{ aspectRatio: "1 / 1", height: 500 }}
          >
            <Cube3D />
          </div>
          <div className="absolute w-full h-full bg-black/80 rounded-2xl flex items-center justify-center flex-col">
            <h1 className="lg:text-7xl text-5xl font-semibold text-white text-center">
              It's not database, <br /> it's NotDatabase.
            </h1>
            <p className="text-gray-400 text-center lg:text-xl mt-2">
              The easiest schema-based type-safe document database.
            </p>
            <div className="flex gap-x-3 mt-6 flex-col lg:flex-row w-full px-4 items-center justify-center gap-2">
              <div className="flex items-center bg-black/60 rounded-xl px-5 py-2 text-white font-mono text-base shadow-lg border border-gray-200/5 backdrop-blur-md">
                <span className="opacity-70 select-all">
                  $ npm install notdb
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText("npm install notdb")
                  }
                  className="ml-3 p-1 rounded hover:bg-white/10 transition-colors"
                  title="Copy to clipboard"
                  type="button"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <rect x="3" y="3" width="13" height="13" rx="2" />
                  </svg>
                </button>
              </div>
              <Link
                href="/docs"
                className="bg-white/10 text-white px-5 py-2 rounded-xl font-medium shadow-lg border border-gray-200/5 hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for TypeScript devs who get it.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-black/10 p-6 rounded-xl border border-gray-200/5">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <SiTypescript className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Type Safe</h3>
            <p className="text-gray-400">
              Full TypeScript support with automatic type inference and
              compile-time safety.
            </p>
          </div>

          <div className="bg-black/10 p-6 rounded-xl border border-gray-200/5">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Schema Based
            </h3>
            <p className="text-gray-400">
              Define your data structure once and get automatic validation and
              type safety.
            </p>
          </div>

          <div className="bg-black/10 p-6 rounded-xl border border-gray-200/5">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-400">
              Built on top of SQLite with optimized queries and minimal
              overhead.
            </p>
          </div>
        </div>
      </div>

      {/* Code Example Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple by Design
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-black/10 p-6 rounded-xl border border-gray-200/5">
            <SyntaxHighlighter
              language="typescript"
              style={dracula}
              customStyle={{
                background: "none",
                fontSize: "0.875rem",
                color: "#f8f8f2",
              }}
              wrapLines={true}
            >
              {`import { createClient } from "notdb";

const db = createClient({
  apiKey: "YOUR_API_KEY",
  schema: {
  users: {
    properties: {
      name: { type: "string", required: true },
      email: { type: "string", required: true, unique: true },
      age: { type: "number" },
    },
  },
}
});`}
            </SyntaxHighlighter>
          </div>

          <div className="bg-black/10 border border-gray-200/5 rounded-2xl p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {crud.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`py-1 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === index
                      ? "bg-white/20 text-white border border-white/20"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <SyntaxHighlighter
              language="javascript"
              style={dracula}
              customStyle={{
                background: "none",
                fontSize: "0.875rem",
                color: "#f8f8f2",
              }}
              wrapLines={true}
            >
              {crud[activeTab].code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://api.iconify.design/solar:box-minimalistic-bold-duotone.svg?color=%23888888"
                  className="w-6"
                />
                <p className="font-semibold text-white">NotDatabase</p>
              </div>
              <p className="text-gray-400 text-sm">
                The easiest schema-based type-safe document database for modern
                applications.
              </p>
            </div>
            {/* <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-white"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/changelog"
                    className="text-gray-400 hover:text-white"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorials"
                    className="text-gray-400 hover:text-white"
                  >
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link
                    href="/examples"
                    className="text-gray-400 hover:text-white"
                  >
                    Examples
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="https://github.com/akinloluwami/notdatabase"
                    className="text-gray-400 hover:text-white"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="/discord"
                    className="text-gray-400 hover:text-white"
                  >
                    Discord
                  </Link>
                </li>
                <li>
                  <Link
                    href="/twitter"
                    className="text-gray-400 hover:text-white"
                  >
                    Twitter
                  </Link>
                </li>
              </ul>
            </div> */}
            <div className="flex items-center gap-x-2">
              <Link
                href="https://github.com/akinloluwami/notdatabase"
                className="p-1 hover:bg-white/10 rounded-sm transition-colors"
                target="_blank"
              >
                <SiGithub size={20} />
              </Link>
              <Link
                href="https://x.com/notdatabase"
                className="p-1 hover:bg-white/10 rounded-sm transition-colors"
                target="_blank"
              >
                <SiX size={20} />
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-200/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} NotDatabase. All rights reserved.
            </p>
            {/* <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm"
              >
                Terms
              </Link>
            </div> */}
          </div>
        </div>
      </footer>
    </>
  );
}
