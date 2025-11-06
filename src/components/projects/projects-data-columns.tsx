import { Loader2Icon, Edit2Icon, LinkIcon, Trash2Icon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ProjectProps } from "@/types/project.types";

import { ProjectClientCell } from "./project-client-cell";

/**
 * Тип функции перевода из next-intl
 */
type TranslationFn = (key: string, values?: Record<string, string>) => string;

export const getProjectColumns = ({
  t,
  onEdit,
  onDelete,
  deletingId,
}: {
  t: TranslationFn;
  onEdit?: (clientId: string) => void;
  onDelete?: (clientId: string) => void;
  deletingId?: string | null;
}): ColumnDef<ProjectProps>[] => [
  {
    accessorKey: "title",
    header: () => t("columns.name"),
  },
  {
    accessorKey: "start_date",
    header: () => t("columns.date_start"),
    cell: ({ row }) =>
      row.original.start_date ? format(row.original.start_date, "PPP") : "-",
  },
  {
    accessorKey: "end_date",
    header: () => t("columns.date_end"),
    cell: ({ row }) =>
      row.original.end_date ? format(row.original.end_date, "PPP") : "-",
  },
  {
    accessorKey: "project_status",
    header: () => t("columns.status"),
  },
  {
    accessorKey: "client",
    header: () => t("columns.client"),
    cell: ({ row }) => (
      <ProjectClientCell
        projectId={row.original.documentId}
        client={row.original.client}
      />
    ),
  },
  {
    accessorKey: "tasks",
    header: () => t("columns.tasks_count"),
    cell: ({ row }) => {
      const count = row.original.tasks?.length ?? 0;
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
      const project = row.original;
      const isDeleting = deletingId === project.documentId;

      return (
        <div className="flex gap-2 justify-end">
          <Button
            size="icon"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onEdit?.(project.documentId)}
            title={t("actions.edit")}
          >
            <Edit2Icon className="h-4 w-4" />
          </Button>

          <Button size="icon" variant="outline" disabled={isDeleting} asChild>
            <Link href={`/projects/${project.documentId}`}>
              <LinkIcon className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            size="icon"
            variant={isDeleting ? "outline" : "destructive"}
            onClick={() => onDelete?.(project.documentId)}
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
