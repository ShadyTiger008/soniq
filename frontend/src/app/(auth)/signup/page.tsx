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
    <div className="bg-background flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradient - Subtle & Theme Aware */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-card border border-border h-20 w-20 flex items-center justify-center rounded-2xl shadow-sm">
              <Music className="text-primary h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
            SONIQ
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Join the Music Revolution</p>
        </div>

        {/* Signup Card */}
        <div className="bg-card border border-border/50 rounded-[40px] mb-8 p-10 shadow-2xl">
          <h2 className="font-black text-foreground mb-8 text-3xl tracking-tight">
            Create account
          </h2>

          <AuthForm type="signup" />

          {/* Terms */}
          <p className="text-muted-foreground mt-8 text-center text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            By signing up, you agree to our{" "}
            <a
              href="#"
              className="text-primary hover:underline smooth-transition"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-primary hover:underline smooth-transition"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Login Link */}
        <p className="text-muted-foreground text-center font-bold text-sm tracking-tight">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline smooth-transition"
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
