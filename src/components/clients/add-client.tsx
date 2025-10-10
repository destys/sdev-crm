"use client";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/use-dialog-store";
import { AddClientModal } from "@/components/modals/add-client-modal";

export const AddClient = () => {
  const { openDialog } = useDialogStore();
  return (
    <Button
      onClick={() =>
        openDialog({
          content: <AddClientModal />,
        })
      }
    >
      <PlusCircleIcon />
      AddClient
    </Button>
  );
};
