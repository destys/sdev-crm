"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectProps } from "@/types/project.types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  title: z.string(),
});

export const EditProjectForm = ({
  project,
  onSubmit,
}: {
  project: ProjectProps;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project.title,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await onSubmit(values);
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
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
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4 mt-auto">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Сохранить изменения"}
          </Button>
          <Button variant={"secondary"} type="button">
            Закрыть
          </Button>
        </div>
      </form>
    </Form>
  );
};
