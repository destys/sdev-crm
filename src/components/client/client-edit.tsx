"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClientProps } from "@/types/client.types";

const formSchema = z.object({
  name: z.string().min(1, "Введите имя клиента"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

interface Props {
  data: ClientProps;
  onSubmit?: (values: z.infer<typeof formSchema>) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const ClientEdit = ({ data, onSubmit, isSubmitting }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      company: data?.company ?? "",
      notes: data?.notes ?? "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await onSubmit?.(values);

      toast.success("Клиент успешно обновлён", {
        position: "bottom-right",
      });
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при сохранении клиента", {
        position: "bottom-right",
      });
    }
  }

  return (
    <form
      id="client-edit-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-4"
    >
      <FieldGroup>
        {/* name */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Имя клиента *</FieldLabel>
              <Input {...field} placeholder="Иван Иванов" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* email */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input {...field} type="email" placeholder="client@example.com" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* phone */}
        <Controller
          name="phone"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Телефон</FieldLabel>
              <Input {...field} placeholder="+7 (999) 000-00-00" />
            </Field>
          )}
        />

        {/* company */}
        <Controller
          name="company"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Компания</FieldLabel>
              <Input {...field} placeholder="ООО Ромашка" />
            </Field>
          )}
        />

        {/* notes */}
        <Controller
          name="notes"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Заметки</FieldLabel>
              <Textarea
                {...field}
                rows={5}
                placeholder="Комментарий о клиенте..."
                className="resize-none"
              />
              <FieldDescription>
                Любая дополнительная информация о клиенте
              </FieldDescription>
            </Field>
          )}
        />
      </FieldGroup>

      <Field orientation="horizontal" className="gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={isSubmitting}
        >
          Сбросить
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохраняю..." : "Сохранить"}
        </Button>
      </Field>
    </form>
  );
};
