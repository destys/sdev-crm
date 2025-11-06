import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div className="flex justify-center">
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
    </div>
  );
}

export { Spinner };
