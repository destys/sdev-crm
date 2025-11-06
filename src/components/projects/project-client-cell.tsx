"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDown, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/use-clients";
import { ClientProps } from "@/types/client.types";
import { useProjects } from "@/hooks/use-projects";

interface ProjectClientCellProps {
  projectId: string;
  client?: { documentId: string; name: string } | null;
}

export function ProjectClientCell({
  projectId,
  client,
}: ProjectClientCellProps) {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(client ?? null);
  const { clients, isLoading: clientsLoading } = useClients();
  const { updateProject } = useProjects();

  async function handleSelect(newClient: ClientProps) {
    setSelectedClient(newClient);
    setOpen(false);

    try {
      await updateProject({
        documentId: projectId,
        data: {
          client: newClient.documentId,
        },
      });
    } catch (error) {
      console.error("Ошибка при обновлении клиента:", error);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedClient?.name ?? "Выберите клиента"}
          <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Поиск клиента..." className="h-9" />
          <CommandEmpty>Клиент не найден</CommandEmpty>
          <CommandGroup>
            {clientsLoading ? (
              <div className="flex justify-center py-2">
                <Loader2Icon className="animate-spin h-4 w-4" />
              </div>
            ) : (
              clients?.map((clientItem) => (
                <CommandItem
                  key={clientItem.documentId}
                  value={clientItem.name}
                  onSelect={() => handleSelect(clientItem)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedClient?.documentId === clientItem.documentId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {clientItem.name}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
