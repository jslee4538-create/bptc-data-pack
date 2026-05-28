import Link from "next/link";
import { LogIn, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-16">
        <div className="text-5xl">🗺️</div>
        <h1 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 text-center">
          로그인하고 나만의 코스를 만들어보세요
        </h1>
        <p className="text-xs text-zinc-500 text-center">
          하루 일정에 가고 싶은 장소를 순서대로 묶을 수 있어요.
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

  const { data: coursesData } = await supabase
    .from("courses")
    .select("*, items:course_items(id)")
    .order("created_at", { ascending: false });

  const courses = (coursesData ?? []) as (Course & { items: { id: string }[] })[];

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4 flex items-end justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
            내 코스
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {courses.length}개의 일정
          </p>
        </div>
        <Link
          href="/courses/new"
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md hover:bg-rose-600 active:scale-95"
        >
          <Plus size={12} /> 새 코스
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="mx-4 py-12 px-6 text-center bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
          <Sparkles size={20} className="mx-auto text-zinc-400" />
          <p className="mt-3 text-xs text-zinc-500">
            아직 만든 코스가 없어요.
            <br />
            <Link href="/courses/new" className="text-rose-500 font-bold hover:underline">
              첫 코스 만들기 →
            </Link>
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full">
                  {course.items.length} 장소
                </span>
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">
                {new Date(course.created_at).toLocaleDateString("ko-KR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
