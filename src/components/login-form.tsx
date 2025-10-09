"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useDialogStore } from "@/store/use-dialog-store";

import { ForgotPasswordModal } from "./modals/forgot-password-modal";
import { LanguageSwitcher } from "./language-switcher";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { openDialog } = useDialogStore();
  const [csrf, setCsrf] = useState("");

  useEffect(() => {
    fetch("/api/auth/csrf", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCsrf(d.token))
      .catch(() => setCsrf(""));
  }, []);

  // ⚙️ Локализованная схема валидации
  const loginSchema = z.object({
    identifier: z.email(t("errors.invalidEmail")),
    password: z.string(t("errors.requiredPassword")),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 🔐 submit handler
  const onSubmit = async (values: LoginFormData) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        credentials: "include", // ✅ обязательно
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("errors.authFailed"));
      }

      // ✅ redirect to dashboard
      const locale = window.location.pathname.split("/")[1];
      router.replace(`/${locale}`);
      reset();
    } catch (err: unknown) {
      console.error("Login error:", err);
    }
  };

  const openForgotModal = () => {
    openDialog({
      content: <ForgotPasswordModal />,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <LanguageSwitcher />
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t("welcome")}</h1>
                <p className="text-muted-foreground text-balance">
                  {t("subtitle")}
                </p>
              </div>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("identifier")}
                />
                {errors.identifier && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.identifier.message}
                  </p>
                )}
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <Button
                    type="button"
                    variant="link"
                    className="ml-auto text-sm"
                    onClick={openForgotModal}
                  >
                    {t("forgot")}
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? t("loading") : t("login")}
                </Button>
              </Field>

              {/* OR */}
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("or")}
              </FieldSeparator>

              {/* Socials */}
              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" disabled>
                  <span className="sr-only">Apple</span>
                </Button>
                <Button variant="outline" type="button" disabled>
                  G<span className="sr-only">Google</span>
                </Button>
                <Button variant="outline" type="button" disabled>
                  TG
                  <span className="sr-only">Telegram</span>
                </Button>
              </Field>

              {/* Signup link */}
              <FieldDescription className="text-center">
                {t("noAccount")}{" "}
                <Link href="/sign-up" className="underline">
                  {t("signup")}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right side image */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/signin.png"
              alt="Image"
              fill
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <FieldDescription className="px-6 text-center text-sm">
        {t("terms1")}{" "}
        <a href="#" className="underline">
          {t("terms2")}
        </a>{" "}
        {t("and")}{" "}
        <a href="#" className="underline">
          {t("privacy")}
        </a>
        .
      </FieldDescription>
    </div>
  );
}
