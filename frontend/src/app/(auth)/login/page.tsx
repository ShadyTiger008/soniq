"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthForm } from "@frontend/components/auth-form";
import { Music } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@frontend/lib/auth-context";

function LoginContent() {
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
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
            Premium Social Music Streaming
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border/50 rounded-[40px] mb-8 p-10 shadow-2xl">
          <h2 className="font-black text-foreground mb-8 text-3xl tracking-tight">
            Welcome back
          </h2>

          <AuthForm type="login" />

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-muted-foreground font-black text-[10px] tracking-widest uppercase">OR</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Social Login */}
          <button className="hover:bg-muted text-foreground font-bold smooth-transition mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border py-4 shadow-sm active:scale-95">
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
             <span className="text-sm font-bold uppercase tracking-widest mt-0.5">Continue with Google</span>
          </button>

          {/* Links */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
            <label className="flex cursor-pointer items-center gap-2 py-2">
              <input
                type="checkbox"
                className="accent-primary h-4 w-4 rounded"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a
              href="#"
              className="text-primary hover:underline smooth-transition"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-muted-foreground text-center font-bold text-sm tracking-tight">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline smooth-transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
