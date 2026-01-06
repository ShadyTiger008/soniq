"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "./auth-store";
import { apiClient } from "./api-client";

// Re-export User type for backward compatibility
export type { User } from "./auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const finishLoading = useAuthStore((state) => state.isLoading) ? () => useAuthStore.setState({ isLoading: false }) : () => {};

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem("soniq_token");
        if (token) {
            apiClient.setToken(token);
            await refreshUser();
        } else {
            // If no token, we are done loading (user remains null)
            useAuthStore.setState({ isLoading: false });
        }
    };
    
    initAuth();
  }, [refreshUser]);

  return <>{children}</>;
}

// Export useAuth hook that maps to useAuthStore
// useAuthStore returns the state which matches AuthContextType interface
export const useAuth = useAuthStore;

