import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EventCard from "@/components/EventCard";
import type { Event } from "@/types/database";
import { formatSeason } from "@/lib/utils";

export const revalidate = 60;

const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

type SearchParams = Promise<{ season?: string }>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { season } = await searchParams;
  const supabase = await createClient();

  const query = supabase.from("events").select("*").order("start_date");
  const { data } = season ? await query.eq("season", season) : await query;

  const events = (data ?? []) as Event[];

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          계절 행사 캘린더
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          교토의 사계절을 만나는 {events.length}개의 축제
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 -mx-4 px-4 scrollbar-none pb-1">
        <Link
          href="/events"
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            !season
              ? "bg-rose-500 text-white shadow-md"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          }`}
        >
          전체
        </Link>
        {SEASONS.map((s) => (
          <Link
            key={s}
            href={`/events?season=${s}`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              season === s
                ? "bg-rose-500 text-white shadow-md"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {formatSeason(s)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 px-4">
        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
            이 계절의 행사가 없어요
          </div>
        ) : (
          groupByMonth(events).map(([month, list]) => (
            <div key={month} className="flex flex-col gap-2">
              <h3 className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 mt-2">
                {month}
              </h3>
              {list.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function groupByMonth(events: Event[]): [string, Event[]][] {
  const map = new Map<string, Event[]>();
  for (const event of events) {
    const d = new Date(event.start_date);
    const key = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    const arr = map.get(key) ?? [];
    arr.push(event);
    map.set(key, arr);
  }
  return Array.from(map.entries());
}
