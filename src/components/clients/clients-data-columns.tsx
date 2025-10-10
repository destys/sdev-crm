"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2Icon, LinkIcon, Trash2Icon } from "lucide-react";

import type { ClientProps } from "@/types/client.types";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Тип функции перевода из next-intl
 * useTranslations("clients") возвращает такую же сигнатуру
 */
type TranslationFn = (key: string, values?: Record<string, string>) => string;

/**
 * Фабрика колонок для таблицы клиентов с i18n
 */
export const getClientColumns = ({
  t,
  onEdit,
  onDelete,
}: {
  t: TranslationFn;
  onEdit?: (clientId: string) => void;
  onDelete?: (clientId: string) => void;
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
      return (
        <div className="flex gap-2 justify-end">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit?.(client.documentId)}
            title={t("actions.edit")}
          >
            <Edit2Icon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit?.(client.documentId)}
            title={t("actions.edit")}
            asChild
          >
            <Link href={`/clients/${client.documentId}`}>
              <LinkIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete?.(client.documentId)}
            title={t("actions.delete")}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
