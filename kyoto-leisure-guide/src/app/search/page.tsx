import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SearchBar from "@/components/SearchBar";
import PlaceCard from "@/components/PlaceCard";
import EventCard from "@/components/EventCard";
import type { Category, Event, Place } from "@/types/database";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string }>;

const ESCAPE_CHARS = /[%_,()*]/g;

function buildIlikePattern(q: string): string {
  return `%${q.replace(ESCAPE_CHARS, "\\$&")}%`;
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">검색</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          장소명 · 일본어 · 주소 · 태그 · 행사 제목까지 한 번에
        </p>
      </div>

      <div className="px-4">
        <SearchBar autoFocus={!query} />
      </div>

      {query ? <Results query={query} /> : <EmptyState />}
    </div>
  );
}

async function Results({ query }: { query: string }) {
  const supabase = await createClient();
  const pattern = buildIlikePattern(query);

  const [placesRes, eventsRes] = await Promise.all([
    supabase
      .from("places")
      .select("*, category:categories(*)")
      .or(
        `name.ilike.${pattern},name_ja.ilike.${pattern},address.ilike.${pattern},description.ilike.${pattern}`
      )
      .order("name")
      .limit(40),
    supabase
      .from("events")
      .select("*")
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order("start_date")
      .limit(20),
  ]);

  const placesByText = (placesRes.data ?? []) as (Place & { category: Category | null })[];

  // 태그는 별도로 검색하여 머지 (text 칼럼 검색과 다른 컬럼 타입)
  const { data: placesByTag } = await supabase
    .from("places")
    .select("*, category:categories(*)")
    .contains("tags", [query])
    .order("name")
    .limit(20);

  const placesById = new Map<string, Place & { category: Category | null }>();
  for (const p of placesByText) placesById.set(p.id, p);
  for (const p of (placesByTag ?? []) as (Place & { category: Category | null })[]) {
    placesById.set(p.id, p);
  }
  const places = Array.from(placesById.values());

  const events = (eventsRes.data ?? []) as Event[];

  const total = places.length + events.length;

  if (total === 0) {
    return (
      <div className="px-4">
        <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
          <Search size={20} className="mx-auto text-zinc-400" />
          <p className="mt-3 text-xs text-zinc-500">
            <strong className="text-zinc-700 dark:text-zinc-200">&ldquo;{query}&rdquo;</strong>
            에 대한 결과가 없어요
          </p>
          <p className="mt-1 text-[10px] text-zinc-400">
            띄어쓰기를 줄이거나, 다른 키워드로 시도해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4">
        <p className="text-[10px] text-zinc-500">
          <strong className="text-zinc-700 dark:text-zinc-200">{total}</strong>개 결과 · 장소{" "}
          {places.length} / 행사 {events.length}
        </p>
      </div>

      {places.length > 0 && (
        <section className="px-4">
          <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
            장소
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="px-4">
          <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
            행사
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function EmptyState() {
  const samples = ["신사", "단풍", "벚꽃", "기온", "맛집", "야경"];
  return (
    <div className="px-4">
      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">
        인기 검색어
      </p>
      <div className="flex flex-wrap gap-2">
        {samples.map((s) => (
          <Link
            key={s}
            href={`/search?q=${encodeURIComponent(s)}`}
            className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-zinc-700"
          >
            # {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
