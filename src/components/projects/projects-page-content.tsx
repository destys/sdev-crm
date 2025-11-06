"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useConfirmDialog } from "@/store/use-confirm-dialog";
import { useSheet } from "@/store/use-sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";

import { ProjectsEmpty } from "./projects-empty";
import { getProjectColumns } from "./projects-data-columns";
import { EditProjectForm } from "./edit-project-form";
import { ProjectsDataTable } from "./projects-data-table";

export const ProjectsPageContent = () => {
  const t = useTranslations("projects");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { projects, total, deleteProject, updateProject, isLoading } =
    useProjects({
      populate: "*",
      pagination: { page, pageSize },
    });

  const { openDialog } = useConfirmDialog();
  const { openSheet, closeSheet } = useSheet();

  if (isLoading) return <Spinner />;
  if (!total) return <ProjectsEmpty />;

  const totalPages = Math.ceil(total / pageSize) || 1;

  const handleEdit = (documentId: string) => {
    const project = projects.find((c) => c.documentId === documentId);
    if (!project) return toast.error("Клиент не найден");

    openSheet({
      id: "edit-project",
      title: t("sheet.editTitle"),
      description: t("sheet.editDescription"),
      size: "lg",
      content: (
        <EditProjectForm
          project={project}
          onSubmit={async (values) => {
            try {
              await updateProject({ documentId, data: values });
              closeSheet();
              toast.success(t("notifications.editSuccess"));
            } catch (err) {
              toast.error(t("notifications.editError"), {
                description: err instanceof Error ? err.message : String(err),
              });
            }
          }}
        />
      ),
      payload: project,
    });
  };

  /** 🔹 Удаление */
  const handleDelete = async (documentId: string) => {
    const confirmed = await openDialog({
      title: t("actions.confirmDeleteTitle"),
      description: t("actions.confirmDeleteDescription"),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    });

    if (!confirmed) {
      toast.info(t("notifications.cancelDelete"));
      return;
    }

    try {
      setDeletingId(documentId);
      await deleteProject(documentId);
      toast.success(t("notifications.deleteSuccess"));
    } catch (error) {
      toast.error(t("notifications.deleteError"), {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setDeletingId(null);
    }
  };

  /** 🔹 Изменение количества записей */
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setPage(1); // сбрасываем страницу
  };

  return (
    <div className="space-y-6">
      <ProjectsDataTable
        columns={getProjectColumns({
          t,
          onEdit: handleEdit,
          onDelete: handleDelete,
          deletingId: deletingId,
        })}
        data={projects}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 🔹 Select для количества записей */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Показать по:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Выбрать" />
            </SelectTrigger>
            <SelectContent>
              {[10, 30, 50, 100, 250].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 🔹 Пагинация */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  aria-disabled={page <= 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  aria-disabled={page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};
