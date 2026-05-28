import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function createCourseAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/courses");

  const rawTitle = formData.get("title");
  const rawDescription = formData.get("description");
  const title = typeof rawTitle === "string" ? rawTitle.trim().slice(0, 80) : "";
  const description =
    typeof rawDescription === "string" ? rawDescription.trim().slice(0, 400) || null : null;

  if (!title) redirect("/courses/new?error=title");

  const { data, error } = await supabase
    .from("courses")
    .insert({ user_id: user.id, title, description })
    .select("id")
    .single();

  if (error || !data) {
    console.error("create course error", error);
    redirect("/courses/new?error=create");
  }

  redirect(`/courses/${data.id}`);
}

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/courses");

  const { error } = await searchParams;
  const errorMessage =
    error === "title"
      ? "코스 이름을 입력해주세요"
      : error === "create"
        ? "코스 생성에 실패했어요. 다시 시도해주세요"
        : null;

  return (
    <div className="flex flex-col gap-4 pt-4 pb-6">
      <div className="px-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500"
        >
          <ArrowLeft size={12} /> 코스 목록
        </Link>
        <h1 className="mt-2 text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
          새 코스 만들기
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          하루 일정에 묶을 장소를 다음 단계에서 추가할 수 있어요
        </p>
      </div>

      <form action={createCourseAction} className="flex flex-col gap-3 px-4">
        <div>
          <label
            htmlFor="title"
            className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1"
          >
            코스 이름 *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={80}
            placeholder="예: 청수사 → 기온 야경 코스"
            className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1"
          >
            메모 (선택)
          </label>
          <textarea
            id="description"
            name="description"
            maxLength={400}
            rows={3}
            placeholder="언제 가는 코스인지, 누구와 가는지 등"
            className="w-full px-3 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none"
          />
        </div>

        {errorMessage && (
          <p className="text-[11px] text-rose-500 font-semibold">{errorMessage}</p>
        )}

        <div className="flex gap-2 mt-2">
          <Link
            href="/courses"
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-center"
          >
            취소
          </Link>
          <button
            type="submit"
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20"
          >
            만들기
          </button>
        </div>
      </form>
    </div>
  );
}
