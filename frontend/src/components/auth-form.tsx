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
        // Redirect to home page after successful auth
        router.push("/home");
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
        <div className="border-red-500/50 bg-red-500/10 text-red-400 rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      {type === "signup" && (
        <div className="relative">
          <User className="text-electric-magenta absolute top-3.5 left-3 h-5 w-5 opacity-60" />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="text-soft-white placeholder-muted-foreground focus:border-electric-magenta focus:ring-electric-magenta smooth-transition w-full rounded-lg border border-[rgba(108,43,217,0.3)] bg-[rgba(26,22,51,0.6)] py-3 pr-4 pl-10 focus:ring-1 focus:outline-none"
          />
        </div>
      )}

      <div className="relative">
        <Mail className="text-ocean-blue absolute top-3.5 left-3 h-5 w-5 opacity-60" />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          className="text-soft-white placeholder-muted-foreground focus:border-ocean-blue focus:ring-ocean-blue smooth-transition w-full rounded-lg border border-[rgba(108,43,217,0.3)] bg-[rgba(26,22,51,0.6)] py-3 pr-4 pl-10 focus:ring-1 focus:outline-none"
        />
      </div>

      <div className="relative">
        <Lock className="text-deep-purple absolute top-3.5 left-3 h-5 w-5 opacity-60" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={3}
          className="text-soft-white placeholder-muted-foreground focus:border-deep-purple focus:ring-deep-purple smooth-transition w-full rounded-lg border border-[rgba(108,43,217,0.3)] bg-[rgba(26,22,51,0.6)] py-3 pr-4 pl-10 focus:ring-1 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="from-deep-purple to-electric-magenta hover:from-electric-magenta hover:to-neon-pink text-soft-white font-heading font-600 smooth-transition neon-glow flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r py-3 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="border-soft-white h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        ) : (
          <>
            {type === "login" ? "Sign In" : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
