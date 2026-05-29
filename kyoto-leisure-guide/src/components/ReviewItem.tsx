"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/database";

type Props = {
  review: Review;
  isOwn: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}개월 전`;
  return `${Math.floor(mo / 12)}년 전`;
}

export default function ReviewItem({ review, isOwn }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = () => {
    if (!confirm("내 후기를 삭제할까요?")) return;
    startTransition(async () => {
      await supabase.from("reviews").delete().eq("id", review.id);
      router.refresh();
    });
  };

  return (
    <div
      className={`rounded-2xl border p-3 ${
        isOwn
          ? "bg-rose-50/50 dark:bg-rose-500/5 border-rose-500/30"
          : "bg-white dark:bg-zinc-800 border-zinc-200/60 dark:border-zinc-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={11}
              className={n <= review.rating ? "text-amber-400" : "text-zinc-300"}
              fill={n <= review.rating ? "currentColor" : "none"}
            />
          ))}
          {isOwn && (
            <span className="ml-1.5 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
              내 후기
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-400 shrink-0">
          {timeAgo(review.created_at)}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-zinc-700 dark:text-zinc-200 leading-5 whitespace-pre-wrap">
        {review.content}
      </p>
      {isOwn && (
        <button
          onClick={remove}
          disabled={pending}
          className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-rose-500 disabled:opacity-50"
        >
          <Trash2 size={10} /> 삭제
        </button>
      )}
    </div>
  );
}
