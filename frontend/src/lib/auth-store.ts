import { create } from 'zustand';
import { z } from 'zod';
import { apiClient } from './api-client';
import { toast } from 'sonner';

// Define User Schema with Zod
export const UserSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  username: z.string(),
  email: z.string().email(),
  avatar: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  refreshUser: async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        const rawUserData = response.data as any;
        
        // Normalize data for Zod validation
        const normalizedData = {
          _id: rawUserData._id || rawUserData.id,
          id: rawUserData._id || rawUserData.id,
          username: rawUserData.username,
          email: rawUserData.email,
          avatar: rawUserData.avatar,
        };

        // Validate with Zod
        const result = UserSchema.safeParse(normalizedData);
        
        if (result.success) {
          set({ user: result.data, isAuthenticated: true, isLoading: false });
        } else {
          console.error("User data validation failed:", result.error);
          // Still set user if possible or treat as error? 
          // For now, let's treat validation failure as potentially corrupt data but maybe we can still use it or fallback.
          // Strict Zod usage: don't set user if invalid.
           apiClient.setToken(null);
           set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        apiClient.setToken(null);
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      apiClient.setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const rawUserData = (response.data as any).user;
        
         // Normalize data
        const normalizedData = {
          _id: rawUserData._id || rawUserData.id,
          id: rawUserData._id || rawUserData.id,
          username: rawUserData.username,
          email: rawUserData.email,
          avatar: rawUserData.avatar,
        };

        // Validate
        const result = UserSchema.safeParse(normalizedData);

        if (result.success) {
          set({ user: result.data, isAuthenticated: true, isLoading: false });
          toast.success("Welcome back!");
          return true;
        } else {
          console.error("Login data validation failed:", result.error);
          toast.error("Login data error");
          set({ isLoading: false });
          return false;
        }
      } else {
        toast.error(response.error || "Login failed");
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      toast.error("An error occurred during login");
      set({ isLoading: false });
      return false;
    }
  },

  signup: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.signup(email, password, username);
      
      if (response.success && response.data) {
        // After signup, login automatically
        const loginResponse = await apiClient.login(email, password);
        if (loginResponse.success && loginResponse.data) {
           const rawUserData = (loginResponse.data as any).user;
           
           // Normalize
            const normalizedData = {
              _id: rawUserData._id || rawUserData.id,
              id: rawUserData._id || rawUserData.id,
              username: rawUserData.username,
              email: rawUserData.email,
              avatar: rawUserData.avatar,
            };

           // Validate
           const result = UserSchema.safeParse(normalizedData);
           
           if (result.success) {
              set({ user: result.data, isAuthenticated: true, isLoading: false });
              toast.success("Account created successfully!");
              return true;
           }
        }
      }
      
      toast.error(response.error || "Signup failed");
      set({ isLoading: false });
      return false;
    } catch (error) {
      toast.error("An error occurred during signup");
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore
    }
    set({ user: null, isAuthenticated: false });
    apiClient.setToken(null);
    toast.success("Logged out successfully");
    // Note: Router redirect needs to be handled by the caller or component since this is a pure store
    // Or we can import 'next/navigation' but hooks only work in components.
    // We will handle redirect in the component calling logout.
    window.location.href = "/"; // Force hard redirect or let component handle it. 
    // Ideally we shouldn't do window.location.href, but inside a store action we are outside React context.
  },
}));
