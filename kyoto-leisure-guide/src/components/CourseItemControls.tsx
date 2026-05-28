"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  itemId: string;
  courseId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export default function CourseItemControls({
  itemId,
  courseId,
  canMoveUp,
  canMoveDown,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const move = (direction: "up" | "down") => {
    startTransition(async () => {
      const { data: items } = await supabase
        .from("course_items")
        .select("id, position")
        .eq("course_id", courseId)
        .order("position");
      if (!items) return;
      const idx = items.findIndex((i) => i.id === itemId);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapIdx < 0 || swapIdx >= items.length) return;
      const a = items[idx];
      const b = items[swapIdx];
      // 임시 큰 값으로 한 쪽 비켜놓고 스왑 (unique constraint 회피)
      const tempPos = -(Date.now() % 2_000_000_000);
      await supabase.from("course_items").update({ position: tempPos }).eq("id", a.id);
      await supabase.from("course_items").update({ position: a.position }).eq("id", b.id);
      await supabase.from("course_items").update({ position: b.position }).eq("id", a.id);
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm("이 장소를 코스에서 제거할까요?")) return;
    startTransition(async () => {
      await supabase.from("course_items").delete().eq("id", itemId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col justify-center gap-1 pr-2">
      <button
        onClick={() => move("up")}
        disabled={!canMoveUp || pending}
        aria-label="위로"
        className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30"
      >
        <ChevronUp size={14} />
      </button>
      <button
        onClick={() => move("down")}
        disabled={!canMoveDown || pending}
        aria-label="아래로"
        className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30"
      >
        <ChevronDown size={14} />
      </button>
      <button
        onClick={remove}
        disabled={pending}
        aria-label="제거"
        className="p-1 rounded-lg text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-30"
      >
        <X size={14} />
      </button>
    </div>
  );
}
