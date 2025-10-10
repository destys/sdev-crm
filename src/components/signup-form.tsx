"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { GalleryVerticalEnd, CheckCircle2, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useAuth } from "@/store/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://saas-crm.some-dev.com";

export function SignupForm({ className }: { className?: string }) {
  const t = useTranslations("signup");
  const { login } = useAuth();
  const router = useRouter();

  // ⚡ alert state
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const [countdown, setCountdown] = useState<number | null>(null);

  // 🧩 Схема валидации (локализованная)
  const formSchema = z
    .object({
      email: z.string().email(t("errors.invalidEmail")),
      password: z.string().min(6, t("errors.minPassword")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("errors.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type SignupFormValues = z.infer<typeof formSchema>;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ⏱️ Обратный отсчёт (3,2,1 → redirect)
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(
      () => setCountdown((prev) => (prev ?? 0) - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const onSubmit = async (values: SignupFormValues) => {
    setAlert({ type: null, message: null });

    try {
      const res = await fetch(`${API_URL}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          username: values.email.split("@")[0],
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || t("alerts.errorDefault"));

      await login({
        email: values.email,
        password: values.password,
      });

      form.reset();

      // ✅ Успешное уведомление + таймер
      setAlert({
        type: "success",
        message: t("alerts.success"),
      });
      setCountdown(3);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Signup error:", err);

      setAlert({
        type: "error",
        message: err?.message || t("alerts.errorDefault"),
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="mt-2 text-xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("alreadyHave")} <Link href="/sign-in">{t("signIn")}</Link>
            </p>
          </div>

          {/* ✅ Alert messages */}
          {alert.type && (
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className="mb-6 transition-all"
            >
              {alert.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <AlertTitle>
                {alert.type === "error"
                  ? t("alerts.errorTitle")
                  : t("alerts.successTitle")}
              </AlertTitle>
              <AlertDescription>
                {alert.message}
                {alert.type === "success" && countdown !== null && (
                  <span className="ml-2 text-muted-foreground">
                    ({t("alerts.redirectIn", { seconds: countdown })})
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? t("loading") : t("signup")}
              </Button>

              <FormDescription className="text-center mt-6 text-sm text-muted-foreground">
                {t("terms1")}{" "}
                <a href="#" className="underline">
                  {t("terms2")}
                </a>{" "}
                {t("and")}{" "}
                <a href="#" className="underline">
                  {t("privacy")}
                </a>
                .
              </FormDescription>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
