// src/store/use-dialog-store.ts
import { ReactNode } from "react";
import { create } from "zustand";

interface DialogState {
  isOpen: boolean;
  title?: string;
  description?: string;
  content?: ReactNode;
  onConfirm?: (() => void) | null;
  onCancel?: (() => void) | null;

  openDialog: (data: {
    title?: string;
    description?: string;
    content?: ReactNode;
    onConfirm?: (() => void) | null;
    onCancel?: (() => void) | null;
  }) => void;

  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  content: null,
  onConfirm: null,
  onCancel: null,

  openDialog: (data) => set({ ...data, isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}));
