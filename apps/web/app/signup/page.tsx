"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../lib/auth-client";
import Ttile from "@/components/ttile";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialSignup = async (provider: "google" | "github") => {
    setIsLoading(provider);
    await authClient.signIn.social({
      provider,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
  };

  return (
    <>
      <Ttile>Sign up - NotDatabase</Ttile>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <Link href="/" className="mb-6">
              <img
                src="/logo.png"
                alt="NotDatabase"
                className="w-10 h-10 transition-transform duration-300 hover:scale-110"
              />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              Get started with NotDatabase for free
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignup("google")}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.15] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SiGoogle className="w-4 h-4" />
              )}
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialSignup("github")}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.15] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === "github" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SiGithub className="w-4 h-4" />
              )}
              Continue with GitHub
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-gray-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
