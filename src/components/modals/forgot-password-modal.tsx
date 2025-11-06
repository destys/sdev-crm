"use client";

import { Mail, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDialogStore } from "@/store/use-dialog-store";
import { API_URL } from "@/constants";

/* -------------------- Schema -------------------- */
const schema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
});

type ForgotPasswordData = z.infer<typeof schema>;

export const ForgotPasswordModal = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const t = useTranslations("auth.forgotPassword");
  const { closeDialog } = useDialogStore();
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || t("error"));
      }

      toast.success(t("success"));
      setIsSent(true);
      setSentEmail(data.email);
      reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Forgot password error:", err);
      toast.error(err.message || t("error"));
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 transition-all", className)}
      {...props}
    >
      {!isSent ? (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <Mail className="size-6" />
              </div>
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              <FieldDescription className="text-muted-foreground">
                {t("subtitle")}
              </FieldDescription>
            </div>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">{t("emailLabel")}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t("loading") : t("submit")}
            </Button>

            <FieldDescription className="text-center mt-4">
              {t("backToLogin")}{" "}
              <Button
                variant={"link"}
                className="text-primary font-medium hover:underline"
                type="button"
              >
                {t("loginLink")}
              </Button>
            </FieldDescription>
          </FieldGroup>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center py-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="text-xl font-semibold">{t("sent.title")}</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            {t("sent.description_before")} <strong>{sentEmail}</strong>{" "}
            {t("sent.description_after")}
          </p>
          <Button className="mt-2">{t("sent.close")}</Button>
        </div>
      )}

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        {t("terms.prefix")}{" "}
        <a href="#" className="underline underline-offset-2">
          {t("terms.terms")}
        </a>{" "}
        {t("terms.and")}{" "}
        <a href="#" className="underline underline-offset-2">
          {t("terms.privacy")}
        </a>
        .
      </FieldDescription>
    </div>
  );
};
