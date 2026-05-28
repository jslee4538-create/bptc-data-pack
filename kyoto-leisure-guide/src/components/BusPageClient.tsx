"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BusRoute, BusStop } from "@/types/database";

const BusMap = dynamic(() => import("@/components/BusMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-zinc-400">
      지도 로딩 중…
    </div>
  ),
});

type Props = {
  routes: BusRoute[];
  stops: BusStop[];
};

export default function BusPageClient({ routes, stops }: Props) {
  const [query, setQuery] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>();

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.route_number.toLowerCase().includes(q) ||
        r.route_name.toLowerCase().includes(q)
    );
  }, [routes, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="노선 번호 또는 경유지 검색"
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>
      </div>

      <div className="px-4">
        <BusMap routes={routes} stops={stops} selectedRouteId={selectedRouteId} />
        {selectedRouteId && (
          <button
            onClick={() => setSelectedRouteId(undefined)}
            className="mt-2 text-[10px] text-rose-500 font-bold hover:underline"
          >
            ← 전체 정류장 보기
          </button>
        )}
      </div>

      <div className="px-4 flex flex-col gap-2">
        <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50">
          노선 목록 ({filteredRoutes.length})
        </h2>
        {filteredRoutes.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
            검색 결과가 없어요
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const isActive = selectedRouteId === route.id;
            return (
              <button
                key={route.id}
                onClick={() =>
                  setSelectedRouteId(isActive ? undefined : route.id)
                }
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  isActive
                    ? "bg-rose-50 dark:bg-rose-500/10 border-rose-500/40 shadow-sm"
                    : "bg-white dark:bg-zinc-800 border-zinc-200/60 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                <span
                  className="shrink-0 px-2.5 py-1 rounded-xl text-white text-xs font-extrabold shadow-sm"
                  style={{ backgroundColor: route.color ?? "#888" }}
                >
                  {route.route_number}
                </span>
                <span className="text-xs text-zinc-700 dark:text-zinc-200 line-clamp-2 flex-1">
                  {route.route_name}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
