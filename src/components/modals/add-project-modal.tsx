"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDialogStore } from "@/store/use-dialog-store";
import { useProjects } from "@/hooks/use-projects";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useClients } from "@/hooks/use-clients";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";

import { AddClientModal } from "./add-client-modal";

/* ---------------- Schema ---------------- */
const formSchema = z.object({
  title: z.string().min(1, "Введите название проекта"),
  start_date: z.date(),
  end_date: z.date().nullable().optional(),
  client: z
    .object({
      documentId: z.string(),
      name: z.string(),
    })
    .optional(),
  notes: z.string().optional(),
});

export type AddClientFormValues = z.infer<typeof formSchema>;

/* ---------------- Component ---------------- */
export const AddProjectModal = () => {
  const { clients, isLoading: clientsLoading } = useClients();
  const [isLoading, setIsLoading] = useState(false);
  const { closeDialog } = useDialogStore();
  const { createProject } = useProjects();
  const { openDialog } = useDialogStore();

  const form = useForm<AddClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      start_date: new Date(),
      end_date: null,
      client: undefined,
      notes: "",
    },
  });

  async function handleSubmit(values: AddClientFormValues) {
    const payload = {
      title: values.title,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date ? values.end_date.toISOString() : null,
      notes: values.notes,
      ...(values.client ? { client: values.client.documentId } : {}),
    };
    try {
      setIsLoading(true);
      await createProject(payload);
      toast.success("Проект успешно добавлен");
      form.reset();
      closeDialog();
    } catch (error) {
      toast.error("Ошибка при добавлении проекта", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col space-y-4 h-full"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название проекта</FormLabel>
              <FormControl>
                <Input placeholder="Введите название проекта" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата начала проекта</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата окончания проекта</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Клиент */}
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Клиент</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl className="w-full">
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? field.value.name : "Выберите клиента"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="!w-full p-0" align={"start"}>
                  <Command>
                    <CommandInput placeholder="Поиск клиента..." />
                    <CommandEmpty>Клиент не найден</CommandEmpty>
                    <CommandGroup>
                      {/* 🔹 Кнопка "Создать клиента" */}
                      <CommandItem
                        onSelect={() =>
                          openDialog({
                            content: <AddClientModal />,
                          })
                        }
                        className="text-primary font-medium"
                      >
                        <PlusIcon /> Создать клиента
                      </CommandItem>
                      <div className="my-1 h-px bg-border" />{" "}
                      {clientsLoading ? (
                        <div className="flex justify-center py-2">
                          <Spinner />
                        </div>
                      ) : (
                        clients?.map((client) => (
                          <CommandItem
                            key={client.documentId}
                            value={client.name}
                            onSelect={() => field.onChange(client)}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.documentId === client.documentId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {client.name}
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заметки</FormLabel>
              <FormControl>
                <Textarea placeholder="Любая полезная информация" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4 mt-auto">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Добавить проект"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
