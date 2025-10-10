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

/* ------------------------------- Types ------------------------------- */
interface ClientListResponse {
  clients: ClientProps[];
  total: number;
}

interface OptimisticContext {
  previous?: ClientListResponse;
}

/* ---------------------------- useClients ----------------------------- */
/**
 * Хук для работы с клиентами
 * -------------------------------------------------
 * Поддерживает:
 *  - получение списка (с пагинацией, фильтрацией, сортировкой)
 *  - получение одного клиента
 *  - создание / обновление / удаление
 *  - оптимистические апдейты и ревалидацию кеша
 */
export const useClients = (options?: FetchOptionsProps) => {
  const queryClient = useQueryClient();

  /* -------------------------- Query utils -------------------------- */
  const queryKey = ["clients", options];

  const queryString = qs.stringify(options, {
    encodeValuesOnly: true,
    skipNulls: true,
  });

  const invalidateClients = () =>
    queryClient.invalidateQueries({ queryKey: ["clients"], exact: false });

  /* -------------------------- GET: all clients -------------------------- */
  const clientsQuery = useQuery<ClientListResponse, Error>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/clients?${queryString}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Не удалось получить список клиентов");
      return res.json();
    },
    staleTime: 1000 * 30, // UX-оптимизация (30 сек)
  });

  /* -------------------------- GET: one client -------------------------- */
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
    });

  /* -------------------------- CREATE -------------------------- */
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
        queryClient.setQueryData<ClientListResponse>(queryKey, {
          clients: [
            {
              ...newClient,
              documentId: `temp-${Date.now()}`,
            } as ClientProps,
            ...previous.clients,
          ],
          total: previous.total + 1,
        });
      }

      return { previous };
    },

    onError: (_err, _newClient, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSettled: invalidateClients,
  });

  /* -------------------------- UPDATE -------------------------- */
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
            String(c.documentId) === documentId ? { ...c, ...data } : c
          ),
        });
      }

      return { previous };
    },

    onError: (_err, _data, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSettled: invalidateClients,
  });

  /* -------------------------- DELETE -------------------------- */
  const deleteClient = useMutation<boolean, Error, string, OptimisticContext>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/clients/${id}`, {
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
          clients: previous.clients.filter(
            (c) => String(c.documentId) !== documentId
          ),
          total: previous.total - 1,
        });
      }

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },

    onSettled: invalidateClients,
  });

  /* -------------------------- Return API -------------------------- */
  return {
    // list
    clients: clientsQuery.data?.clients ?? [],
    total: clientsQuery.data?.total,
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    error: clientsQuery.error,

    // single client
    useClient,

    // mutations
    createClient: createClient.mutateAsync,
    updateClient: updateClient.mutateAsync,
    deleteClient: deleteClient.mutateAsync,
  };
};
