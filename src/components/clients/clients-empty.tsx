import { ArrowUpRightIcon, FolderCodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { AddClient } from "./add-client";

export function ClientsEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderCodeIcon />
        </EmptyMedia>
        <EmptyTitle>No Clients Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any clients yet. Get started by creating your
          first client.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <AddClient />
          <Button variant="outline">Import Project</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
