"use client";

import { create } from "zustand";

interface SheetOptions {
  id?: string; // например "edit-client"
  title?: string;
  description?: string;
  side?: "left" | "right" | "top" | "bottom";
  payload?: unknown; // можно передать объект клиента
  content?: React.ReactNode; // JSX контент
  size?: "sm" | "md" | "lg" | "xl"; // кастомные размеры
}

interface SheetState {
  open: boolean;
  options: SheetOptions;
  openSheet: (options: SheetOptions) => void;
  closeSheet: () => void;
}

export const useSheet = create<SheetState>((set) => ({
  open: false,
  options: {},
  openSheet: (options) => set({ open: true, options }),
  closeSheet: () => set({ open: false, options: {} }),
}));
