import { Bus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { BusRoute, BusStop } from "@/types/database";

type Props = {
  lat: number;
  lng: number;
};

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default async function NearbyBusSection({ lat, lng }: Props) {
  const supabase = await createClient();
  const [stopsRes, routesRes] = await Promise.all([
    supabase.from("bus_stops").select("*"),
    supabase.from("bus_routes").select("*"),
  ]);

  const stops = (stopsRes.data ?? []) as BusStop[];
  const routes = (routesRes.data ?? []) as BusRoute[];
  const routeMap = new Map(routes.map((r) => [r.id, r]));

  const nearest = stops
    .map((s) => ({ stop: s, distance: haversine(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  if (nearest.length === 0) {
    return null;
  }

  return (
    <section className="px-4">
      <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-1">
        <Bus size={12} /> 가까운 버스 정류장
      </h2>
      <div className="flex flex-col gap-2">
        {nearest.map(({ stop, distance }) => {
          const stopRoutes = stop.route_ids
            .map((rid) => routeMap.get(rid))
            .filter((r): r is BusRoute => Boolean(r));
          return (
            <div
              key={stop.id}
              className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {stop.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    도보 약 {formatDistance(distance)}
                  </p>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${stop.lat}&mlon=${stop.lng}#map=18/${stop.lat}/${stop.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-rose-500 hover:underline shrink-0 mt-0.5"
                >
                  지도 →
                </a>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {stopRoutes.map((r) => (
                  <span
                    key={r.id}
                    title={r.route_name}
                    className="px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold shadow-sm"
                    style={{ backgroundColor: r.color ?? "#888" }}
                  >
                    {r.route_number}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-400 mt-2">
        💡 직선 거리 기준이며 실제 도보 경로와 다를 수 있어요
      </p>
    </section>
  );
}
