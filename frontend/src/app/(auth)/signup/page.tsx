"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthForm } from "@frontend/components/auth-form";
import { Music } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@frontend/lib/auth-context";

function SignupContent() {
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
        <div className="bg-electric-magenta/20 absolute top-20 right-10 h-72 w-72 animate-pulse rounded-full opacity-20 blur-3xl" />
        <div className="bg-deep-purple/10 absolute bottom-20 left-10 h-96 w-96 animate-pulse rounded-full opacity-20 blur-3xl" />
        <div className="bg-neon-cyan/5 absolute top-1/3 right-1/3 h-80 w-80 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="glass-card rounded-full p-4">
              <Music className="text-ocean-blue h-10 w-10" />
            </div>
          </div>
          <h1 className="font-heading from-deep-purple via-electric-magenta to-neon-pink mb-2 bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent">
            SONIQ
          </h1>
          <p className="text-muted-foreground">Join the Music Revolution</p>
        </div>

        {/* Signup Card */}
        <div className="glass-card mb-6 p-8">
          <h2 className="font-heading font-700 text-soft-white mb-6 text-2xl">
            Create Account
          </h2>

          <AuthForm type="signup" />

          {/* Terms */}
          <p className="text-muted-foreground mt-6 text-center text-xs">
            By signing up, you agree to our{" "}
            <a
              href="#"
              className="text-ocean-blue hover:text-neon-cyan smooth-transition"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-ocean-blue hover:text-neon-pink smooth-transition"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Login Link */}
        <p className="text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-electric-magenta hover:text-neon-pink smooth-transition font-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
