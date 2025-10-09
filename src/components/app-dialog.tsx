"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { useDialogStore } from "@/store/use-dialog-store";
import { cn } from "@/lib/utils";

/**
 * Универсальный контейнер модалки, который слушает useDialogStore.
 * Содержимое (content) полностью управляется внешними компонентами.
 */
export function AppDialog() {
  const { isOpen, closeDialog, title, description, content } = useDialogStore();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={closeDialog}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl bg-card p-6 shadow-2xl border border-border transition-all"
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <DialogPrimitive.Title
                className={cn("text-lg font-semibold", !title && "hidden")}
              >
                {title}
              </DialogPrimitive.Title>

              <DialogPrimitive.Description
                className={cn(
                  "text-sm text-muted-foreground",
                  !description && "hidden"
                )}
              >
                {description}
              </DialogPrimitive.Description>
            </div>

            <button
              onClick={closeDialog}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-[60px]">{content}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
