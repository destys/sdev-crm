import { Loader2Icon, Edit2Icon, LinkIcon, Trash2Icon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ClientProps } from "@/types/client.types";

/**
 * Тип функции перевода из next-intl
 */
type TranslationFn = (key: string, values?: Record<string, string>) => string;

export const getClientColumns = ({
  t,
  onEdit,
  onDelete,
  deletingId,
}: {
  t: TranslationFn;
  onEdit?: (clientId: string) => void;
  onDelete?: (clientId: string) => void;
  deletingId?: string | null;
}): ColumnDef<ClientProps>[] => [
  {
    accessorKey: "name",
    header: () => t("columns.name"),
  },
  {
    accessorKey: "company",
    header: () => t("columns.company"),
  },
  {
    accessorKey: "email",
    header: () => t("columns.email"),
  },
  {
    accessorKey: "phone",
    header: () => t("columns.phone"),
  },
  {
    accessorKey: "projects",
    header: () => t("columns.projects"),
    cell: ({ row }) => {
      const count = row.original.projects?.length ?? 0;
      return (
        <span className="flex items-center justify-center text-center size-10 rounded-full bg-background">
          {count}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => "",
    cell: ({ row }) => {
      const client = row.original;
      const isDeleting = deletingId === client.documentId;

      return (
        <div className="flex gap-2 justify-end">
          <Button
            size="icon"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onEdit?.(client.documentId)}
            title={t("actions.edit")}
          >
            <Edit2Icon className="h-4 w-4" />
          </Button>

          <Button size="icon" variant="outline" disabled={isDeleting} asChild>
            <Link href={`/clients/${client.documentId}`}>
              <LinkIcon className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            size="icon"
            variant={isDeleting ? "outline" : "destructive"}
            onClick={() => onDelete?.(client.documentId)}
            disabled={isDeleting}
            title={t("actions.delete")}
          >
            {isDeleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Trash2Icon className="h-4 w-4" />
            )}
          </Button>
        </div>
      );
    },
  },
];
