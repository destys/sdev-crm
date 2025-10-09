"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrf, setCsrf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 получаем CSRF токен при загрузке
  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d) => setCsrf(d.token))
      .catch(() => setCsrf(""));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrf,
      },
      body: JSON.stringify({ identifier: email, password }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    // ✅ если успех — редиректим на /[locale]/(app)/dashboard
    router.replace(`/${window.location.pathname.split("/")[1]}/dashboard`);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t("welcome")}</h1>
                <p className="text-muted-foreground text-balance">
                  {t("subtitle")}
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    {t("forgot")}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "..." : t("login")}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("or")}
              </FieldSeparator>

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

              <FieldDescription className="text-center">
                {t("noAccount")}{" "}
                <Link href="/sign-up" className="underline">
                  {t("signup")}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

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

      <FieldDescription className="px-6 text-center">
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
