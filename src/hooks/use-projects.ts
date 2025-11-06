/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import qs from "qs";

import type { ProjectProps, UpdateProjectDto } from "@/types/project.types";
import type { FetchOptionsProps } from "@/types/fetch-options.type";
import { UserProps } from "@/types/user.types";
import { ClientProps } from "@/types/client.types";
import { ProjectStartusProps } from "@/types/project-status.types";

interface ProjectListResponse {
  projects: ProjectProps[];
  total: number;
}

interface OptimisticContext {
  previous?: ProjectListResponse;
}

export const useProjects = (options?: FetchOptionsProps) => {
  const queryClient = useQueryClient();

  /* ---------------------- Stable key + query string ---------------------- */
  const queryString = qs.stringify(options, {
    encodeValuesOnly: true,
    skipNulls: true,
    sort: (a, b) => a.localeCompare(b),
  });

  const queryKey = ["projects", queryString] as const;

  const refetchProjects = async () => {
    await queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "projects",
    });
    await queryClient.refetchQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "projects",
    });
  };

  /* ------------------------------- LIST ------------------------------- */
  const projectsQuery = useQuery<ProjectListResponse, Error>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/projects?${queryString}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch project list");
      return res.json();
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  /* ------------------------------ DETAIL ------------------------------ */
  const useProject = (
    documentId?: string
  ): UseQueryResult<ProjectProps, Error> =>
    useQuery<ProjectProps, Error>({
      queryKey: ["project", documentId],
      enabled: Boolean(documentId),
      queryFn: async () => {
        const res = await fetch(`/api/projects/${documentId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch project details");
        return res.json();
      },
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    });

  /* ------------------------------ CREATE ------------------------------ */
  const createProject = useMutation<
    ProjectProps,
    Error,
    Partial<UpdateProjectDto>,
    OptimisticContext
  >({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },

    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ProjectListResponse>(queryKey);

      if (previous) {
        const optimisticProject: ProjectProps = {
          documentId: `temp-${Date.now()}`,
          title: newProject.title ?? "Новый проект",
          start_date: newProject.start_date ?? new Date().toISOString(),

          // ⚙️ нормализуем end_date: null → пустая строка
          end_date:
            newProject.end_date === null || newProject.end_date === undefined
              ? ""
              : newProject.end_date,

          // ⚙️ Strapi получает client (string), а в UI ждём объект
          client: {
            documentId:
              typeof newProject.client === "string"
                ? newProject.client
                : newProject.client ?? "",
            name: "—", // временно до refetch
          } as ClientProps,

          // остальные поля — дефолтные
          project_status: (newProject.project_status ??
            ({} as ProjectStartusProps)) as ProjectProps["project_status"],
          attachments: [],
          assignees: {} as UserProps,
          tasks: [],
        };

        queryClient.setQueryData<ProjectListResponse>(queryKey, {
          projects: [optimisticProject, ...previous.projects],
          total: previous.total + 1,
        });
      }

      return { previous };
    },

    onError: (_err, _newProject, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSuccess: async (createdProject) => {
      const prev = queryClient.getQueryData<ProjectListResponse>(queryKey);
      if (prev) {
        queryClient.setQueryData<ProjectListResponse>(queryKey, {
          ...prev,
          projects: [
            createdProject,
            ...prev.projects.filter((p) => !p.documentId?.startsWith("temp-")),
          ],
        });
      }

      // 🔄 легкий debounce перед refetch
      setTimeout(refetchProjects, 300);
    },
  });

  /* ------------------------------ UPDATE ------------------------------ */
  /* ------------------------------ UPDATE ------------------------------ */
  const updateProject = useMutation<
    ProjectProps,
    Error,
    { documentId: string; data: Partial<UpdateProjectDto> },
    OptimisticContext
  >({
    mutationFn: async ({ documentId, data }) => {
      const res = await fetch(`/api/projects/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },

    onMutate: async ({ documentId, data }) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ProjectListResponse>(queryKey);

      if (previous) {
        // 🧩 создаём безопасную версию списка проектов
        const updatedProjects = previous.projects.map((p) => {
          if (p.documentId !== documentId) return p;

          // ⚙️ если пришёл client как строка (documentId),
          // оставляем старый объект клиента (p.client), чтобы не ломать тип ProjectProps
          const safeClient =
            typeof data.client === "string" ? p.client : (data.client as any);

          return {
            ...p,
            ...data,
            client: safeClient,
          };
        });

        queryClient.setQueryData<ProjectListResponse>(queryKey, {
          ...previous,
          projects: updatedProjects,
        });
      }

      return { previous };
    },

    onError: (_err, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSettled: refetchProjects,
  });

  /* ------------------------------ DELETE ------------------------------ */
  const deleteProject = useMutation<boolean, Error, string, OptimisticContext>({
    mutationFn: async (documentId) => {
      const res = await fetch(`/api/projects/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return true;
    },

    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProjectListResponse>(queryKey);
      if (previous) {
        queryClient.setQueryData<ProjectListResponse>(queryKey, {
          projects: previous.projects.filter(
            (p) => p.documentId !== documentId
          ),
          total: previous.total - 1,
        });
      }
      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSuccess: async () => {
      await refetchProjects();
    },
  });

  return {
    projects: projectsQuery.data?.projects ?? [],
    total: projectsQuery.data?.total,
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    error: projectsQuery.error,
    useProject,
    createProject: createProject.mutateAsync,
    updateProject: updateProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
  };
};
