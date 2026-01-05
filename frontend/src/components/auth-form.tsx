"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@frontend/lib/auth-context";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit?: (data: any) => void;
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success = false;

      if (type === "login") {
        success = await login(formData.email, formData.password);
      } else {
        if (!formData.username.trim()) {
          setError("Username is required");
          setIsLoading(false);
          return;
        }
        success = await signup(
          formData.username,
          formData.email,
          formData.password,
        );
      }

      if (success) {
        onSubmit?.(formData);
        // Get redirect from URL params or default to /home
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect") || "/home";
        // Small delay to ensure state is updated
        setTimeout(() => {
          router.push(redirect);
        }, 100);
      } else {
        setError(
          type === "login"
            ? "Invalid email or password"
            : "Failed to create account",
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border p-4 text-xs font-bold uppercase tracking-widest leading-relaxed">
          {error}
        </div>
      )}

      {type === "signup" && (
        <div className="relative group">
          <User className="text-primary absolute top-4 left-4 h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 smooth-transition w-full rounded-2xl border border-border bg-muted/30 py-4 pr-4 pl-12 focus:ring-4 focus:outline-none font-medium"
          />
        </div>
      )}

      <div className="relative group">
        <Mail className="text-primary absolute top-4 left-4 h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          className="text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 smooth-transition w-full rounded-2xl border border-border bg-muted/30 py-4 pr-4 pl-12 focus:ring-4 focus:outline-none font-medium"
        />
      </div>

      <div className="relative group">
        <Lock className="text-primary absolute top-4 left-4 h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={3}
          className="text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 smooth-transition w-full rounded-2xl border border-border bg-muted/30 py-4 pr-4 pl-12 focus:ring-4 focus:outline-none font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs smooth-transition flex w-full items-center justify-center gap-2 rounded-2xl py-4 disabled:opacity-50 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] mt-2"
      >
        {isLoading ? (
          <span className="border-primary-foreground h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        ) : (
          <>
            {type === "login" ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4 stroke-[3px]" />
          </>
        )}
      </button>
    </form>
  );
}
