import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import CategoryFilter from "@/components/CategoryFilter";
import PlaceCard from "@/components/PlaceCard";
import type { Category, Place } from "@/types/database";

export const revalidate = 60;

type SearchParams = Promise<{ cat?: string }>;

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { cat } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, placesRes] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    cat
      ? supabase
          .from("places")
          .select("*, category:categories(*)")
          .eq("category_id", cat)
          .order("name")
      : supabase
          .from("places")
          .select("*, category:categories(*)")
          .order("name"),
  ]);

  const cats = (categories ?? []) as Category[];
  const places = (placesRes.data ?? []) as (Place & { category: Category | null })[];
  const activeCat = cats.find((c) => c.id === cat);

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          관광지 & 맛집
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {activeCat ? `${activeCat.icon} ${activeCat.name}` : "교토의 모든 장소"} ·{" "}
          {places.length}개
        </p>
      </div>

      <Suspense fallback={<div className="px-4 text-xs text-zinc-400">로딩 중…</div>}>
        <CategoryFilter categories={cats} basePath="/places" />
      </Suspense>

      <div className="grid grid-cols-2 gap-3 px-4">
        {places.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
            등록된 장소가 없어요
          </div>
        ) : (
          places.map((place) => <PlaceCard key={place.id} place={place} />)
        )}
      </div>
    </div>
  );
}
