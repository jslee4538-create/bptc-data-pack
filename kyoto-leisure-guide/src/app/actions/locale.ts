"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, type Locale } from "@/i18n/locales";

export async function setLocaleAction(locale: Locale) {
  if (!isLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
