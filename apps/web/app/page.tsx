"use client";

import Link from "next/link";
import Ttile from "@/components/ttile";
import { SiGithub } from "react-icons/si";
import Cube3D from "@/components/cube-3d";

export default function Home() {
  return (
    <>
      <Ttile>NotDatabase</Ttile>
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
              <div className="flex items-center bg-black/60 rounded-xl px-5 py-2 text-white font-mono text-base shadow-lg border border-white/10 backdrop-blur-md">
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
                className="bg-white/10 text-white px-5 py-2 rounded-xl font-medium shadow-lg border border-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
