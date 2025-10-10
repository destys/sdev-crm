"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { UserProps } from "@/types/user.types";

interface AuthState {
  user: UserProps | null;
  token: string | null;
  loading: boolean;

  hydrate: () => Promise<void>;
  login: (args: {
    email: string;
    password: string;
    locale?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProps | null) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      setUser: (user) => set({ user }),

      /**
       * 🔁 Восстановление авторизации (через /api/auth/me)
       */
      hydrate: async () => {
        try {
          set({ loading: true });

          const res = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (!res.ok) {
            set({ user: null, token: null, loading: false });
            return;
          }

          const user = await res.json();
          set({ user, loading: false });
        } catch (e) {
          console.error("Hydrate error:", e);
          set({ user: null, loading: false });
        }
      },

      /**
       * 🔐 Авторизация (через твой /api/auth/login)
       */
      login: async ({ email, password }) => {
        try {
          set({ loading: true });

          // Получаем CSRF токен
          const csrfRes = await fetch("/api/auth/csrf", {
            credentials: "include",
          });
          const { token: csrf } = await csrfRes.json();

          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrf,
            },
            credentials: "include",
            body: JSON.stringify({ identifier: email, password }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Auth failed");
          }

          // ✅ JWT уже установился в httpOnly cookie → просто берём юзера
          const userRes = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (!userRes.ok) throw new Error("Failed to fetch user");
          const user = await userRes.json();

          set({ user, loading: false });
        } catch (err) {
          console.error("Login error:", err);
          set({ loading: false });
          throw err;
        }
      },

      /**
       * 🚪 Выход
       */
      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (e) {
          console.warn("Logout error:", e);
        } finally {
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // не сохраняем loading
    }
  )
);
