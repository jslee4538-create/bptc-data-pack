"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

type Props = {
  autoFocus?: boolean;
};

export default function SearchBar({ autoFocus = false }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  const submit = (q: string) => {
    const trimmed = q.trim();
    startTransition(() => {
      router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className="relative"
    >
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder="장소, 행사, 태그로 검색"
        className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            submit("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          aria-label="지우기"
        >
          <X size={14} />
        </button>
      )}
      {pending && (
        <div className="absolute right-9 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </form>
  );
}
