"use client";

import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [session, setSession] = useState<{} | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await authClient.getSession();
      setSession(data);
    })();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
            alt="NotDatabase"
          />
          <span className="font-semibold text-white text-[15px] tracking-tight">
            NotDatabase
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/docs"
            className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
          >
            Documentation
          </Link>
          <Link
            href="https://github.com/akinloluwami/notdatabase"
            className="text-sm text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
            target="_blank"
          >
            <SiGithub size={18} />
          </Link>

          <div className="w-px h-5 bg-white/10 mx-2" />

          {session ? (
            <Link href="/dashboard">
              <Button
                size="sm"
                className="rounded-full px-4 bg-white text-black hover:bg-gray-200 font-medium text-[13px]"
              >
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 text-gray-300 hover:text-white hover:bg-white/[0.06] text-[13px]"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-full px-4 bg-white text-black hover:bg-gray-200 font-medium text-[13px]"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-5 py-4 flex flex-col gap-1">
            <Link
              href="/docs"
              className="text-sm text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Documentation
            </Link>
            <Link
              href="https://github.com/akinloluwami/notdatabase"
              className="text-sm text-gray-400 hover:text-white px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors flex items-center gap-2"
              target="_blank"
              onClick={() => setMobileOpen(false)}
            >
              <SiGithub size={16} />
              GitHub
            </Link>

            <div className="h-px bg-white/[0.06] my-2" />

            {session ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-full bg-white text-black hover:bg-gray-200 font-medium">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06]"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-full bg-white text-black hover:bg-gray-200 font-medium">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
