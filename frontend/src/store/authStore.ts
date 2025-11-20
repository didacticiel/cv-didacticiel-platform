import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CV } from '@/types/api.types';

interface AuthState {
  user: User | null;
  currentCV: CV | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setCurrentCV: (cv: CV | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      currentCV: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setCurrentCV: (cv) =>
        set({
          currentCV: cv,
        }),

      setIsLoading: (isLoading) =>
        set({
          isLoading,
        }),

      logout: () =>
        set({
          user: null,
          currentCV: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
