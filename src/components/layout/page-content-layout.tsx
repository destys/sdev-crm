"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContentLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageContentLayout = ({
  title,
  description,
  actions,
  children,
  className,
}: PageContentLayoutProps) => {
  return (
    <section className={cn("space-y-4 lg:space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
        </div>

        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">{children}</div>
    </section>
  );
};
