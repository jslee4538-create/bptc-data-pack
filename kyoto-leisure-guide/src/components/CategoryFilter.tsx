"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/types/database";

type Props = {
  categories: Category[];
  basePath?: string;
};

export default function CategoryFilter({ categories, basePath = "/places" }: Props) {
  const params = useSearchParams();
  const active = params.get("cat");

  const buildHref = (catId: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (catId) p.set("cat", catId);
    else p.delete("cat");
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 -mx-4 scrollbar-none">
      <Link
        href={buildHref(null)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          !active
            ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        전체
      </Link>
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <Link
            key={cat.id}
            href={buildHref(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              isActive
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <span>{cat.icon ?? "📍"}</span>
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
