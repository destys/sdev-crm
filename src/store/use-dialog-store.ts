// src/store/use-dialog-store.ts
import { ReactNode } from "react";
import { create } from "zustand";

export interface DialogData {
  id: string;
  title?: string;
  description?: string;
  content?: ReactNode;
  onConfirm?: (() => void) | null;
  onCancel?: (() => void) | null;
}

interface DialogState {
  dialogs: DialogData[];

  openDialog: (data: Omit<DialogData, "id">) => void;
  closeDialog: (id?: string) => void;
  closeAll: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  dialogs: [],

  openDialog: (data) =>
    set((state) => ({
      dialogs: [
        ...state.dialogs,
        {
          ...data,
          id: Math.random().toString(36).slice(2, 9), // уникальный id
        },
      ],
    })),

  closeDialog: (id) =>
    set((state) => ({
      dialogs: id
        ? state.dialogs.filter((d) => d.id !== id)
        : state.dialogs.slice(0, -1), // если id не передан — закрываем последнюю
    })),

  closeAll: () => set({ dialogs: [] }),
}));
