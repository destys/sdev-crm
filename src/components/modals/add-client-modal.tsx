"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

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
import { useSheet } from "@/store/use-sheet";
import { useClients } from "@/hooks/use-clients";
import { useDialogStore } from "@/store/use-dialog-store";

/* ---------------- Schema ---------------- */
const formSchema = z.object({
  name: z.string().min(1, "Введите имя клиента"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional(),
});

export type AddClientFormValues = z.infer<typeof formSchema>;

/* ---------------- Component ---------------- */
export const AddClientModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { closeDialog } = useDialogStore();
  const { createClient } = useClients();

  const form = useForm<AddClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
    },
  });

  async function handleSubmit(values: AddClientFormValues) {
    try {
      setIsLoading(true);
      await createClient(values);
      toast.success("Клиент успешно добавлен");
      form.reset();
      closeDialog();
    } catch (error) {
      toast.error("Ошибка при добавлении клиента", {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя клиента</FormLabel>
              <FormControl>
                <Input placeholder="Введите имя" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Компания</FormLabel>
              <FormControl>
                <Input placeholder="Компания" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input placeholder="+7 (999) 999-99-99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4 mt-auto">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Добавить клиента"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
