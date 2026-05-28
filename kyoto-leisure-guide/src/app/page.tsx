import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PlaceCard from "@/components/PlaceCard";
import EventCard from "@/components/EventCard";
import type { Category, Event, Place } from "@/types/database";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: categories }, { data: places }, { data: events }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("places")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("events")
      .select("*")
      .gte("end_date", today)
      .order("start_date")
      .limit(3),
  ]);

  const cats = (categories ?? []) as Category[];
  const featured = (places ?? []) as (Place & { category: Category | null })[];
  const upcoming = (events ?? []) as Event[];

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Hero */}
      <section className="px-4 pt-4">
        <div className="relative rounded-3xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-400 p-5 text-white shadow-lg shadow-rose-500/20 overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
              <Sparkles size={10} /> KYOTO 2026
            </span>
            <h2 className="mt-2 text-xl font-extrabold leading-tight">
              교토에서의 한 학기,
              <br />더 알차게 채워봐요
            </h2>
            <p className="mt-1 text-xs text-white/85">
              사계절 행사 · 숨은 명소 · 버스 노선까지 한 번에
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4">
        <SectionHeading title="카테고리" href="/places" />
        <div className="grid grid-cols-4 gap-2">
          {cats.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/places?cat=${cat.id}`}
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-zinc-700 transition-colors active:scale-95"
            >
              <span className="text-2xl">{cat.icon ?? "📍"}</span>
              <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 line-clamp-1 text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="px-4">
        <SectionHeading title="다가오는 행사" href="/events" />
        <div className="grid grid-cols-1 gap-3">
          {upcoming.length === 0 ? (
            <EmptyHint message="아직 등록된 다가오는 행사가 없어요" />
          ) : (
            upcoming.map((event) => <EventCard key={event.id} event={event} compact />)
          )}
        </div>
      </section>

      {/* Featured places */}
      <section className="px-4">
        <SectionHeading title="추천 명소" href="/places" />
        <div className="grid grid-cols-2 gap-3">
          {featured.length === 0 ? (
            <EmptyHint message="장소 데이터가 아직 준비되지 않았어요" />
          ) : (
            featured.map((place) => <PlaceCard key={place.id} place={place} />)
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <Link
        href={href}
        className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5 hover:text-rose-600"
      >
        전체보기 <ArrowRight size={10} />
      </Link>
    </div>
  );
}

function EmptyHint({ message }: { message: string }) {
  return (
    <div className="col-span-full py-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
      {message}
    </div>
  );
}
