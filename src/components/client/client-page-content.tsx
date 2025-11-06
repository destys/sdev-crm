"use client";

import { useClients } from "@/hooks/use-clients";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { PageContentLayout } from "@/components/layout/page-content-layout";

import { ClientEdit } from "./client-edit";
import { ClientProjects } from "./client-projects";

interface Props {
  documentId: string;
}

export const ClientPageContent = ({ documentId }: Props) => {
  const { useClient } = useClients();
  const clientQuery = useClient(documentId);

  const { data: client, isLoading, isError, error } = clientQuery;

  return (
    <PageContentLayout title={`Клиент: ${client?.name ?? "Загрузка..."}`}>
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="py-10 text-center text-destructive">
          Ошибка: {error?.message || "Не удалось загрузить данные клиента"}
        </div>
      )}

      {!isLoading && !isError && client && (
        <div className="space-y-4">
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">Редактирование клиента</TabsTrigger>
              <TabsTrigger value="projects">Проекты клиента</TabsTrigger>
              <TabsTrigger value="tasks">Задачи клиента</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <ClientEdit data={client} />
            </TabsContent>
            <TabsContent value="projects">
              <ClientProjects data={client} />
            </TabsContent>
            <TabsContent value="tasks">{/* TODO:add tasks */}</TabsContent>
          </Tabs>
        </div>
      )}
    </PageContentLayout>
  );
};
