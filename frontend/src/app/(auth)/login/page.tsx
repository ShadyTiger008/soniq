"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthForm } from "@frontend/components/auth-form";
import { Music } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@frontend/lib/auth-context";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const redirect = searchParams.get("redirect") || "/home";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  return (
    <div className="from-midnight-black via-deep-navy to-midnight-black flex min-h-screen items-center justify-center bg-gradient-to-b p-4">
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-deep-purple/20 absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full opacity-20 blur-3xl" />
        <div className="bg-electric-magenta/10 absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full opacity-20 blur-3xl" />
        <div className="bg-ocean-blue/10 absolute top-1/2 left-1/3 h-80 w-80 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="glass-card rounded-full p-4">
              <Music className="text-electric-magenta h-10 w-10" />
            </div>
          </div>
          <h1 className="font-heading from-deep-purple via-electric-magenta to-neon-pink mb-2 bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent">
            SONIQ
          </h1>
          <p className="text-muted-foreground">
            Premium Social Music Streaming
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card mb-6 p-8">
          <h2 className="font-heading font-700 text-soft-white mb-6 text-2xl">
            Welcome Back
          </h2>

          <AuthForm type="login" />

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="to-deep-purple/30 h-px flex-1 bg-gradient-to-r from-transparent" />
            <span className="text-muted-foreground text-xs">OR</span>
            <div className="to-deep-purple/30 h-px flex-1 bg-gradient-to-l from-transparent" />
          </div>

          {/* Social Login */}
          <button className="hover:border-electric-magenta text-soft-white smooth-transition mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(108,43,217,0.3)] py-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="border-deep-purple/30 bg-midnight-black h-4 w-4 rounded"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a
              href="#"
              className="text-electric-magenta hover:text-neon-pink smooth-transition"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-electric-magenta hover:text-neon-pink smooth-transition font-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
