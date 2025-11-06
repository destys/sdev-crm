import { notFound } from "next/navigation";

import { ClientPageContent } from "@/components/client/client-page-content";

interface Props {
  params: Promise<{ documentId: string }>;
}

const ClientPage = async ({ params }: Props) => {
  const { documentId } = await params;

  if (!documentId) return notFound();
  return <ClientPageContent documentId={documentId} />;
};

export default ClientPage;
