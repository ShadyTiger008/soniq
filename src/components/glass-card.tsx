import type React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function GlassCard({
  children,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`border-deep-purple/15 rounded-xl border ${className}`}
      style={{
        backgroundColor: "rgba(26, 22, 51, 0.6)",
        backdropFilter: "blur(20px)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassPanel({
  children,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`border-deep-purple/20 rounded-lg border ${className}`}
      style={{
        backgroundColor: "rgba(26, 22, 51, 0.4)",
        backdropFilter: "blur(20px)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
