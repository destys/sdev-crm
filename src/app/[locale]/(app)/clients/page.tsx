import { AddClient } from "@/components/clients/add-client";
import { ClientsPageContent } from "@/components/clients/clients-page-content";
import { PageContentLayout } from "@/components/layout/page-content-layout";

const ClientsPage = async () => {
  return (
    <PageContentLayout title="Клиенты" actions={<AddClient />}>
      <ClientsPageContent />
    </PageContentLayout>
  );
};

export default ClientsPage;
