import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(str: string): string {
  if (!str) return "";

  // Разбиваем строку по пробелам, фильтруем пустые
  const words = str.trim().split(/\s+/).filter(Boolean);

  // Берем первые буквы первых двух слов
  const initials = words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return initials;
}
