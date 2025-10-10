"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useSheet } from "@/store/use-sheet";
import { cn } from "@/lib/utils";

export const AppSheet = () => {
  const { open, options, closeSheet } = useSheet();

  const { title, description, content, side = "right", size = "lg" } = options;

  return (
    <Sheet open={open} onOpenChange={closeSheet}>
      <SheetContent side={side} className={cn("overflow-y-auto")}>
        <SheetHeader>
          {title && <SheetTitle>{title}</SheetTitle>}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="p-4 flex-auto">{content}</div>
      </SheetContent>
      {/* <SheetFooter>
        <Button type="submit">Save changes</Button>
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter> */}
    </Sheet>
  );
};
