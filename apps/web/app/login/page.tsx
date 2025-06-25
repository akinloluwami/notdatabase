"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Ttile from "@/components/ttile";
import { set } from "date-fns";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(provider);
    await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <>
      <Ttile>Login - NotDatabase</Ttile>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <Card className="bg-gray900 border-gray-100/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-white">Sign In</CardTitle>
              <CardDescription className="text-gray-400">
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {/* Social Login Buttons */}
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

          {/* Signup Link */}
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
