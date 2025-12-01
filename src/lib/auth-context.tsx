"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy credentials for demo
const DUMMY_USERS = [
  { id: "1", username: "demo", email: "demo@soniq.com", password: "demo123" },
  { id: "2", username: "admin", email: "admin@soniq.com", password: "admin123" },
  { id: "3", username: "test", email: "test@soniq.com", password: "test123" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("soniq_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("soniq_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username, email: foundUser.email };
      setUser(userData);
      localStorage.setItem("soniq_user", JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }

    // Also allow any email/password for demo purposes
    const userData = {
      id: Date.now().toString(),
      username: email.split("@")[0],
      email,
    };
    setUser(userData);
    localStorage.setItem("soniq_user", JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const userData = {
      id: Date.now().toString(),
      username,
      email,
    };
    setUser(userData);
    localStorage.setItem("soniq_user", JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("soniq_user");
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

