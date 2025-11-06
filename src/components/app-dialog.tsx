"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { useDialogStore } from "@/store/use-dialog-store";
import { cn } from "@/lib/utils";

export function AppDialog() {
  const { dialogs, closeDialog } = useDialogStore();

  return (
    <>
      {dialogs.map((dialog) => (
        <DialogPrimitive.Root
          key={dialog.id}
          open
          onOpenChange={() => closeDialog(dialog.id)}
        >
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
                    className={cn(
                      "text-lg font-semibold",
                      !dialog.title && "hidden"
                    )}
                  >
                    {dialog.title}
                  </DialogPrimitive.Title>

                  <DialogPrimitive.Description
                    className={cn(
                      "text-sm text-muted-foreground",
                      !dialog.description && "hidden"
                    )}
                  >
                    {dialog.description}
                  </DialogPrimitive.Description>
                </div>

                <button
                  onClick={() => closeDialog(dialog.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-[60px]">{dialog.content}</div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      ))}
    </>
  );
}
