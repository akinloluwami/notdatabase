"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Ttile from "@/components/ttile";

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Ttile>Signup</Ttile>

      <Link href="/">
        <img src="/logo.png" alt="Logo" className="w-16 h-16 mb-8" />
      </Link>
      <div className="w-full max-w-md">
        <Card className="bg-gray900 border-gray-100/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose your preferred sign-up method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("google")}
                disabled={isLoading !== null}
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                {isLoading === "google"
                  ? "Creating account..."
                  : "Continue with Google"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("github")}
                disabled={isLoading !== null}
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                {isLoading === "github"
                  ? "Creating account..."
                  : "Continue with GitHub"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-gray-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
