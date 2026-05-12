"use client";

import { AuthProvider } from "@frontend/lib/auth-context";
import { SocketProvider } from "@frontend/lib/socket-context";
import { ToastProvider } from "@frontend/components/toast-provider";
import { ThemeProvider } from "@frontend/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <SocketProvider roomId={null}>
          {children}
          <ToastProvider />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
