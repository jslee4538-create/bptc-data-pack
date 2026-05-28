"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Props = {
  targetType: "place" | "event";
  targetId: string;
  variant?: "icon" | "full";
};

export default function BookmarkButton({ targetType, targetId, variant = "full" }: Props) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", user.id)
          .eq("target_type", targetType)
          .eq("target_id", targetId)
          .maybeSingle();
        if (!active) return;
        if (data) {
          setBookmarked(true);
          setBookmarkId(data.id);
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase, targetType, targetId]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleToggle = () => {
    if (!user) {
      handleLogin();
      return;
    }
    startTransition(async () => {
      if (bookmarked && bookmarkId) {
        const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId);
        if (!error) {
          setBookmarked(false);
          setBookmarkId(null);
        }
      } else {
        const { data, error } = await supabase
          .from("bookmarks")
          .insert({
            user_id: user.id,
            target_type: targetType,
            target_id: targetId,
          })
          .select("id")
          .single();
        if (!error && data) {
          setBookmarked(true);
          setBookmarkId(data.id);
        }
      }
    });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading || pending}
        aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        className={`p-2 rounded-full backdrop-blur-md transition-all ${
          bookmarked
            ? "bg-rose-500 text-white shadow-md"
            : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200 hover:bg-white"
        } ${pending ? "opacity-50" : ""}`}
      >
        <Heart size={16} fill={bookmarked ? "currentColor" : "none"} />
      </button>
    );
  }

  if (!user && !loading) {
    return (
      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <LogIn size={14} />
        로그인하고 즐겨찾기 저장
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading || pending}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
        bookmarked
          ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      } ${pending || loading ? "opacity-60" : ""}`}
    >
      <Heart size={14} fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "즐겨찾기에 저장됨" : "즐겨찾기 추가"}
    </button>
  );
}
