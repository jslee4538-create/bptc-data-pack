"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, type Locale } from "@/i18n/locales";

const LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

const FLAGS: Record<Locale, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
};

export default function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (locale: Locale) => {
    setOpen(false);
    startTransition(() => {
      setLocaleAction(locale);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-label="언어 변경"
        className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors flex items-center gap-1"
      >
        <Globe size={16} />
        <span className="text-[10px] font-bold uppercase">{current}</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <ul className="absolute right-0 top-full mt-1 w-32 z-40 bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
            {LOCALES.map((loc) => (
              <li key={loc}>
                <button
                  onClick={() => choose(loc)}
                  className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2 transition-colors ${
                    loc === current
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
                      : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span>{FLAGS[loc]}</span>
                  <span>{LABELS[loc]}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
