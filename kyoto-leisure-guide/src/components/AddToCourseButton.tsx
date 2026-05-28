"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Check, Plus, Route } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types/database";

type Props = {
  placeId: string;
};

export default function AddToCourseButton({ placeId }: Props) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      setLoggedIn(Boolean(user));
      if (!user) return;
      const { data: c } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: existing } = await supabase
        .from("course_items")
        .select("course_id")
        .eq("place_id", placeId);
      if (!active) return;
      setCourses((c ?? []) as Course[]);
      setAddedIds(new Set((existing ?? []).map((e) => e.course_id)));
    })();
    return () => {
      active = false;
    };
  }, [supabase, placeId]);

  const addTo = (courseId: string) => {
    startTransition(async () => {
      const { data: maxRow } = await supabase
        .from("course_items")
        .select("position")
        .eq("course_id", courseId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextPos = (maxRow?.position ?? -1) + 1;
      const { error } = await supabase
        .from("course_items")
        .insert({ course_id: courseId, place_id: placeId, position: nextPos });
      if (!error) {
        setAddedIds((prev) => new Set([...prev, courseId]));
      }
    });
  };

  if (loggedIn === false) {
    return null;
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98]"
      >
        <Route size={14} />
        코스에 담기
      </button>

      {open && (
        <div className="mt-2 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 p-3 flex flex-col gap-2">
          {courses.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-2">
              아직 만든 코스가 없어요
              <Link
                href="/courses/new"
                className="block mt-1 text-rose-500 font-bold hover:underline"
              >
                새 코스 만들기 →
              </Link>
            </div>
          ) : (
            <>
              {courses.map((course) => {
                const added = addedIds.has(course.id);
                return (
                  <button
                    key={course.id}
                    onClick={() => !added && addTo(course.id)}
                    disabled={added || pending}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      added
                        ? "bg-rose-500/10 text-rose-500 cursor-default"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-semibold line-clamp-1">
                      {course.title}
                    </span>
                    {added ? (
                      <Check size={12} className="shrink-0" />
                    ) : (
                      <Plus size={12} className="shrink-0 text-zinc-400" />
                    )}
                  </button>
                );
              })}
              <Link
                href="/courses/new"
                className="text-xs text-rose-500 font-bold text-center mt-1 hover:underline"
              >
                + 새 코스 만들기
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
