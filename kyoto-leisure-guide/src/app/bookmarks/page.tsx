import Link from "next/link";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PlaceCard from "@/components/PlaceCard";
import EventCard from "@/components/EventCard";
import type { Bookmark, Category, Event, Place } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-16">
        <div className="text-5xl">🔖</div>
        <h1 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 text-center">
          로그인하고 마음에 드는 장소를 저장하세요
        </h1>
        <p className="text-xs text-zinc-500 text-center">
          Google 계정으로 1초만에 로그인할 수 있어요.
          <br />
          오른쪽 상단의 로그인 버튼을 눌러주세요.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
        >
          <LogIn size={12} /> 홈으로 가기
        </Link>
      </div>
    );
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bms = (bookmarks ?? []) as Bookmark[];
  const placeIds = bms.filter((b) => b.target_type === "place").map((b) => b.target_id);
  const eventIds = bms.filter((b) => b.target_type === "event").map((b) => b.target_id);

  const [placesRes, eventsRes] = await Promise.all([
    placeIds.length
      ? supabase
          .from("places")
          .select("*, category:categories(*)")
          .in("id", placeIds)
      : Promise.resolve({ data: [] }),
    eventIds.length
      ? supabase.from("events").select("*").in("id", eventIds)
      : Promise.resolve({ data: [] }),
  ]);

  const places = (placesRes.data ?? []) as (Place & { category: Category | null })[];
  const events = (eventsRes.data ?? []) as Event[];

  const isEmpty = places.length === 0 && events.length === 0;

  return (
    <div className="flex flex-col gap-5 pt-4 pb-6">
      <div className="px-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          내 즐겨찾기
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          저장한 장소 {places.length}개 · 행사 {events.length}개
        </p>
      </div>

      {isEmpty ? (
        <div className="mx-4 py-12 px-6 text-center bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
          <div className="text-3xl">💭</div>
          <p className="mt-2 text-xs text-zinc-500">
            아직 저장한 항목이 없어요.
            <br />
            마음에 드는 장소나 행사의 하트를 눌러보세요.
          </p>
        </div>
      ) : (
        <>
          {places.length > 0 && (
            <section className="px-4">
              <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
                저장한 장소
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
                저장한 행사
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
