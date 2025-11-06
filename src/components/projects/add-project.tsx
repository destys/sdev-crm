"use client";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/use-dialog-store";
import { AddProjectModal } from "@/components/modals/add-project-modal";

export const AddProject = () => {
  const { openDialog } = useDialogStore();
  return (
    <Button
      onClick={() =>
        openDialog({
          content: <AddProjectModal />,
        })
      }
    >
      <PlusCircleIcon />
      Add Project
    </Button>
  );
};
