import { createClient } from "@/lib/supabase/server";
import BusPageClient from "@/components/BusPageClient";
import type { BusRoute, BusStop } from "@/types/database";

export const revalidate = 300;

export default async function BusPage() {
  const supabase = await createClient();

  const [routesRes, stopsRes] = await Promise.all([
    supabase.from("bus_routes").select("*").order("route_number"),
    supabase.from("bus_stops").select("*").order("name"),
  ]);

  const routes = (routesRes.data ?? []) as BusRoute[];
  const stops = (stopsRes.data ?? []) as BusStop[];

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          버스 노선 & 지도
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          교토 시내 주요 {routes.length}개 노선 · {stops.length}개 정류장
        </p>
      </div>
      <BusPageClient routes={routes} stops={stops} />
    </div>
  );
}
