"use client";

import { create } from "zustand";

interface ConfirmDialogOptions<T = unknown> {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  payload?: T;
}

interface ConfirmDialogState {
  open: boolean;
  options: ConfirmDialogOptions;
  resolve?: (value: boolean | PromiseLike<boolean>) => void;
  openDialog: <T = unknown>(
    options: ConfirmDialogOptions<T>
  ) => Promise<boolean>;
  closeDialog: (confirmed: boolean) => void;
}

export const useConfirmDialog = create<ConfirmDialogState>((set, get) => ({
  open: false,
  options: {},
  resolve: undefined,

  openDialog: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve });
    });
  },

  closeDialog: (confirmed) => {
    const { resolve } = get();
    if (resolve) resolve(confirmed);
    set({ open: false, options: {}, resolve: undefined });
  },
}));
