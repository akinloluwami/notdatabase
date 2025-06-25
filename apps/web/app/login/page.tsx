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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(provider);
    await authClient.signIn.social({
      provider,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
  };

  return (
    <>
      <Ttile>Login - NotDatabase</Ttile>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Link href="/">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mb-8" />
        </Link>
        <div className="w-full max-w-md">
          <Card className="bg-gray900 border-gray-100/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-white">Sign In</CardTitle>
              <CardDescription className="text-gray-400">
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading !== null}
                  className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  {isLoading === "google"
                    ? "Signing in..."
                    : "Continue with Google"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("github")}
                  disabled={isLoading !== null}
                  className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  {isLoading === "github"
                    ? "Signing in..."
                    : "Continue with GitHub"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-white hover:text-gray-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
