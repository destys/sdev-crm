"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import qs from "qs";

import type { ClientProps, UpdateClientDto } from "@/types/client.types";
import type { FetchOptionsProps } from "@/types/fetch-options.type";

interface ClientListResponse {
  clients: ClientProps[];
  total: number;
}

interface OptimisticContext {
  previous?: ClientListResponse;
}

export const useClients = (options?: FetchOptionsProps) => {
  const queryClient = useQueryClient();

  /* ---------------------- Стабильный ключ + строка ---------------------- */
  const queryString = qs.stringify(options, {
    encodeValuesOnly: true,
    skipNulls: true,
    sort: (a, b) => a.localeCompare(b),
  });

  const queryKey = ["clients", queryString] as const;

  const refetchClients = async () => {
    await queryClient.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "clients",
    });
    await queryClient.refetchQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "clients",
    });
  };

  /* ------------------------------- LIST ------------------------------- */
  const clientsQuery = useQuery<ClientListResponse, Error>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/clients?${queryString}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Не удалось получить список клиентов");
      return res.json();
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  /* ------------------------------ DETAIL ------------------------------ */
  const useClient = (documentId?: string): UseQueryResult<ClientProps, Error> =>
    useQuery<ClientProps, Error>({
      queryKey: ["client", documentId],
      enabled: Boolean(documentId),
      queryFn: async () => {
        const res = await fetch(`/api/clients/${documentId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Не удалось получить клиента");
        return res.json();
      },
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    });

  /* ------------------------------ CREATE ------------------------------ */
  /* ------------------------------ CREATE ------------------------------ */
  const createClient = useMutation<
    ClientProps,
    Error,
    Partial<UpdateClientDto>,
    OptimisticContext
  >({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ошибка при создании клиента");
      return res.json();
    },

    onMutate: async (newClient) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ClientListResponse>(queryKey);

      if (previous) {
        // 🔹 Добавляем клиента моментально
        const optimisticClient: ClientProps = {
          ...(newClient as ClientProps),
          documentId: `temp-${Date.now()}`,
        };

        queryClient.setQueryData<ClientListResponse>(queryKey, {
          clients: [optimisticClient, ...previous.clients],
          total: previous.total + 1,
        });
      }

      return { previous };
    },

    onError: (_err, _newClient, ctx) => {
      // 🔹 Если ошибка — возвращаем предыдущий список
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSuccess: async (createdClient) => {
      // 🔹 Заменяем временный элемент настоящим (чтобы избежать “двойников”)
      const prev = queryClient.getQueryData<ClientListResponse>(queryKey);
      if (prev) {
        queryClient.setQueryData<ClientListResponse>(queryKey, {
          ...prev,
          clients: [
            createdClient,
            ...prev.clients.filter((c) => !c.documentId?.startsWith("temp-")),
          ],
        });
      }

      // 🔹 Через 300 мс рефетчим с сервера для точной синхронизации
      setTimeout(refetchClients, 300);
    },
  });

  /* ------------------------------ UPDATE ------------------------------ */
  const updateClient = useMutation<
    ClientProps,
    Error,
    { documentId: string; data: Partial<UpdateClientDto> },
    OptimisticContext
  >({
    mutationFn: async ({ documentId, data }) => {
      const res = await fetch(`/api/clients/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Ошибка при обновлении клиента");
      return res.json();
    },

    onMutate: async ({ documentId, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClientListResponse>(queryKey);
      if (previous) {
        queryClient.setQueryData<ClientListResponse>(queryKey, {
          ...previous,
          clients: previous.clients.map((c) =>
            c.documentId === documentId ? { ...c, ...data } : c
          ),
        });
      }
      return { previous };
    },

    onError: (_err, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSettled: refetchClients,
  });

  /* ------------------------------ DELETE ------------------------------ */
  const deleteClient = useMutation<boolean, Error, string, OptimisticContext>({
    mutationFn: async (documentId) => {
      const res = await fetch(`/api/clients/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Ошибка при удалении клиента");
      return true;
    },

    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClientListResponse>(queryKey);
      if (previous) {
        queryClient.setQueryData<ClientListResponse>(queryKey, {
          clients: previous.clients.filter((c) => c.documentId !== documentId),
          total: previous.total - 1,
        });
      }
      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSuccess: async () => {
      // 💥 Только после успешного удаления с сервера
      await refetchClients();
    },
  });

  return {
    clients: clientsQuery.data?.clients ?? [],
    total: clientsQuery.data?.total,
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    error: clientsQuery.error,
    useClient,
    createClient: createClient.mutateAsync,
    updateClient: updateClient.mutateAsync,
    deleteClient: deleteClient.mutateAsync,
  };
};
