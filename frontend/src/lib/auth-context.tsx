"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "./api-client";
import { toast } from "sonner";

interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token and validate
    const token = localStorage.getItem("soniq_token");
    if (token) {
      apiClient.setToken(token);
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data as any;
        setUser({
          _id: userData._id || userData.id,
          id: userData._id || userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
        });
      } else {
        // Token invalid, clear it
        apiClient.setToken(null);
        setUser(null);
      }
    } catch (error) {
      apiClient.setToken(null);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const userData = (response.data as any).user;
        setUser({
          _id: userData._id || userData.id,
          id: userData._id || userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
        });
        toast.success("Welcome back!");
        setIsLoading(false);
        return true;
      } else {
        toast.error(response.error || "Login failed");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      toast.error("An error occurred during login");
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.signup(email, password, username);
      
      if (response.success && response.data) {
        // After signup, login automatically
        const loginResponse = await apiClient.login(email, password);
        if (loginResponse.success && loginResponse.data) {
          const userData = (loginResponse.data as any).user;
          setUser({
            _id: userData._id || userData.id,
            id: userData._id || userData.id,
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
          });
          toast.success("Account created successfully!");
          setIsLoading(false);
          return true;
        }
      }
      
      toast.error(response.error || "Signup failed");
      setIsLoading(false);
      return false;
    } catch (error) {
      toast.error("An error occurred during signup");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    setUser(null);
    apiClient.setToken(null);
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
