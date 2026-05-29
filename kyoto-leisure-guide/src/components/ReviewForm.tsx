"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/database";

type Props = {
  placeId: string;
  myReview: Review | null;
  loggedIn: boolean;
};

export default function ReviewForm({ placeId, myReview, loggedIn }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [rating, setRating] = useState<number>(myReview?.rating ?? 5);
  const [content, setContent] = useState<string>(myReview?.content ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!loggedIn) {
    const handleLogin = async () => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    };
    return (
      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200"
      >
        <LogIn size={12} /> 로그인하고 후기 남기기
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError("후기 내용을 입력해주세요");
      return;
    }
    setError(null);
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error: upsertError } = await supabase.from("reviews").upsert(
        {
          user_id: user.id,
          place_id: placeId,
          content: trimmed.slice(0, 1000),
          rating,
        },
        { onConflict: "user_id,place_id" }
      );
      if (upsertError) {
        setError("저장에 실패했어요");
        return;
      }
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 p-3 flex flex-col gap-2"
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="p-0.5"
            aria-label={`별점 ${n}`}
          >
            <Star
              size={18}
              className={n <= rating ? "text-amber-400" : "text-zinc-300"}
              fill={n <= rating ? "currentColor" : "none"}
            />
          </button>
        ))}
        <span className="text-[10px] font-bold text-zinc-500 ml-1">{rating}/5</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder={myReview ? "후기 수정…" : "어떻게 좋았나요? 다른 교환학생들에게 꿀팁을 알려주세요"}
        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none"
      />
      {error && <p className="text-[10px] text-rose-500 font-semibold">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">{content.length}/1000</span>
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold disabled:opacity-60"
        >
          {pending ? "저장 중…" : myReview ? "수정" : "후기 등록"}
        </button>
      </div>
    </form>
  );
}
