"use client";

import { useEffect } from "react";

import { useAuth } from "@/store/use-auth";

export function AppInitializer() {
  const { hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
