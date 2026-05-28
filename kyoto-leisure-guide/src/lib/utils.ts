import { PRICE_LABELS, SEASON_LABELS } from "@/types/database";

export function formatPriceRange(price: number | null): string {
  if (price === null || price === undefined) return "정보 없음";
  return PRICE_LABELS[price] ?? "정보 없음";
}

export function formatSeason(season: string): string {
  return SEASON_LABELS[season] ?? season;
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return start === end ? fmt(s) : `${fmt(s)} ~ ${fmt(e)}`;
}

export function isUpcoming(endDate: string): boolean {
  return new Date(endDate).getTime() >= Date.now() - 1000 * 60 * 60 * 24;
}

export function gradientFor(seed: string): string {
  const gradients = [
    "from-rose-400 to-orange-300",
    "from-amber-400 to-pink-400",
    "from-emerald-400 to-teal-400",
    "from-sky-400 to-indigo-400",
    "from-violet-400 to-fuchsia-400",
    "from-orange-400 to-red-400",
    "from-lime-400 to-emerald-400",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return gradients[Math.abs(hash) % gradients.length];
}

export function seasonClass(season: string): string {
  switch (season) {
    case "spring":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-300";
    case "summer":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "autumn":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-300";
    case "winter":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-300";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300";
  }
}
