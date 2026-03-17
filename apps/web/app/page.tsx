"use client";

import Link from "next/link";
import Ttile from "@/components/ttile";
import { SiGithub, SiX } from "react-icons/si";
import { SiTypescript } from "react-icons/si";
import Cube3D from "@/components/cube-3d";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import Navbar from "@/components/navbar";

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

  const notdbsetup = `import { createClient } from "notdb";

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
});`;

  return (
    <>
      <Ttile>NotDatabase</Ttile>
      <Navbar />

      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 w-full grid lg:grid-cols-2 items-center gap-8 pt-24 lg:pt-0">
          <div className="flex flex-col items-start">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              It&apos;s not database,
              <br />
              it&apos;s NotDatabase.
            </h1>

            <p className="text-gray-400 text-lg lg:text-xl mt-6 max-w-md leading-relaxed">
              The easiest schema-based type-safe document database.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-10">
              <div className="group flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3 font-mono text-sm text-gray-300 backdrop-blur-sm hover:border-white/[0.15] transition-colors">
                <span className="text-gray-500">$</span>
                <span className="select-all">npm install notdb</span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText("npm install notdb")
                  }
                  className="ml-1 p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  title="Copy to clipboard"
                  type="button"
                >
                  <svg
                    width="16"
                    height="16"
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
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Read the docs
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5l6 6m0 0l-6 6m6-6H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="w-full aspect-square max-w-[350px] lg:max-w-[420px] mx-auto">
            <Cube3D />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

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

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple by Design
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-black/10 p-6 rounded-xl border border-gray-200/5 overflow-x-hidden">
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
              {notdbsetup}
            </SyntaxHighlighter>
          </div>

          <div className="bg-black/10 border border-gray-200/5 rounded-2xl p-6 overflow-x-hidden">
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
