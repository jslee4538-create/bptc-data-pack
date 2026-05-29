import Link from "next/link";
import { Heart, LogIn, Route } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EventNotifications from "@/components/EventNotifications";
import RecommendButton from "@/components/RecommendButton";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-16">
        <div className="text-5xl">👤</div>
        <h1 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 text-center">
          로그인하고 나만의 가이드를 만들어보세요
        </h1>
        <p className="text-xs text-zinc-500 text-center">
          즐겨찾기와 코스가 계정에 저장돼요.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
        >
          <LogIn size={12} /> 홈으로
        </Link>
      </div>
    );
  }

  const [{ count: bookmarkCount }, { count: courseCount }] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <div className="flex flex-col gap-5 pt-4 pb-6">
      <div className="px-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          마이페이지
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">
          {user.email}
        </p>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        <Link
          href="/bookmarks"
          className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-md shadow-rose-500/20 hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <Heart size={18} />
          <div>
            <p className="text-[10px] font-bold opacity-80">즐겨찾기</p>
            <p className="text-xl font-extrabold mt-0.5">{bookmarkCount ?? 0}</p>
          </div>
        </Link>
        <Link
          href="/courses"
          className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <Route size={18} />
          <div>
            <p className="text-[10px] font-bold opacity-80">내 코스</p>
            <p className="text-xl font-extrabold mt-0.5">{courseCount ?? 0}</p>
          </div>
        </Link>
      </div>

      <RecommendButton />

      <EventNotifications />
    </div>
  );
}
