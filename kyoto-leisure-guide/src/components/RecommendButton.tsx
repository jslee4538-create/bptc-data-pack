"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

type RecommendItem = {
  id: string;
  reason: string;
};

type ResolvedItem = RecommendItem & {
  name: string;
  category_id: string | null;
};

export default function RecommendButton() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ResolvedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "추천을 받지 못했어요");
        setItems(null);
        return;
      }
      const raw = (data.items ?? []) as RecommendItem[];
      if (raw.length === 0) {
        setError(data.message ?? "추천할 장소가 없어요");
        setItems([]);
        return;
      }
      // 장소 이름 조회 (공개 API: anon으로도 OK)
      const ids = raw.map((r) => r.id);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: places } = await supabase
        .from("places")
        .select("id, name, category_id")
        .in("id", ids);
      const lookup = new Map((places ?? []).map((p) => [p.id, p]));
      setItems(
        raw.map((r) => ({
          ...r,
          name: lookup.get(r.id)?.name ?? "(이름 없음)",
          category_id: lookup.get(r.id)?.category_id ?? null,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("네트워크 오류가 발생했어요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4">
      <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-4 text-white shadow-lg shadow-violet-500/20">
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <h2 className="text-sm font-extrabold">AI 맞춤 추천</h2>
        </div>
        <p className="text-[11px] text-white/85 mt-1">
          즐겨찾기 취향을 분석해 다음에 갈 만한 곳을 골라드려요
        </p>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="mt-3 w-full px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-xs font-bold disabled:opacity-60"
        >
          {loading ? "추천 분석 중…" : items ? "다시 추천받기" : "추천 받기"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-zinc-500 text-center">{error}</p>
      )}

      {items && items.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item, idx) => (
            <Link
              key={item.id}
              href={`/places/${item.id}`}
              className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 hover:shadow-md transition-shadow active:scale-[0.99]"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300 font-extrabold text-sm flex items-center justify-center">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                  💭 {item.reason}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
