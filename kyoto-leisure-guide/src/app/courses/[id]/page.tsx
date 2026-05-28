import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CourseItemControls from "@/components/CourseItemControls";
import type { Category, Course, CourseItem, Place } from "@/types/database";
import { gradientFor } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function deleteCourseAction(formData: FormData) {
  "use server";
  const id = formData.get("course_id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", id);
  redirect("/courses");
}

type Params = Promise<{ id: string }>;

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/courses");

  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!courseData) notFound();
  const course = courseData as Course;

  const { data: itemsData } = await supabase
    .from("course_items")
    .select("*, place:places(*, category:categories(*))")
    .eq("course_id", id)
    .order("position");

  const items = (itemsData ?? []) as (CourseItem & {
    place: (Place & { category: Category | null }) | null;
  })[];

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500"
        >
          <ArrowLeft size={12} /> 내 코스
        </Link>
        <h1 className="mt-2 text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          {course.title}
        </h1>
        {course.description && (
          <p className="mt-1 text-xs text-zinc-500">{course.description}</p>
        )}
        <p className="mt-1 text-[10px] text-zinc-400">
          {new Date(course.created_at).toLocaleDateString("ko-KR")} · {items.length}개 장소
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mx-4 py-12 px-6 text-center bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
          <p className="text-xs text-zinc-500">
            아직 코스에 담긴 장소가 없어요.
            <br />
            <Link href="/places" className="text-rose-500 font-bold hover:underline">
              장소 둘러보기 →
            </Link>
          </p>
          <p className="mt-3 text-[10px] text-zinc-400">
            💡 장소 상세에서 “이 코스에 담기”를 눌러 추가할 수 있어요
          </p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-stretch gap-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 overflow-hidden"
            >
              <div className="shrink-0 w-12 flex items-center justify-center bg-rose-500/10 text-rose-500 font-extrabold">
                {index + 1}
              </div>
              {item.place ? (
                <>
                  <div
                    className={`shrink-0 w-20 h-20 bg-gradient-to-br ${gradientFor(
                      item.place.id
                    )} flex items-center justify-center text-2xl`}
                  >
                    {item.place.category?.icon ?? "📍"}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <Link
                      href={`/places/${item.place.id}`}
                      className="text-sm font-bold text-zinc-900 dark:text-zinc-50 hover:text-rose-500 line-clamp-1"
                    >
                      {item.place.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-500">
                      <MapPin size={9} />
                      <span className="line-clamp-1">{item.place.address}</span>
                    </div>
                    {item.memo && (
                      <p className="mt-1 text-[10px] text-zinc-500 italic">
                        💭 {item.memo}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 p-3 text-xs text-zinc-400">
                  연결된 장소를 찾을 수 없어요
                </div>
              )}
              <CourseItemControls
                itemId={item.id}
                courseId={course.id}
                canMoveUp={index > 0}
                canMoveDown={index < items.length - 1}
              />
            </div>
          ))}
        </div>
      )}

      <form action={deleteCourseAction} className="px-4 mt-4">
        <input type="hidden" name="course_id" value={course.id} />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
        >
          <Trash2 size={12} /> 이 코스 삭제
        </button>
      </form>
    </div>
  );
}
