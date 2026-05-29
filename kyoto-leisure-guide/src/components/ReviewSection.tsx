import { MessageCircle, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";
import type { Review } from "@/types/database";

type Props = {
  placeId: string;
};

export default async function ReviewSection({ placeId }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData ?? []) as Review[];
  const myReview = user ? reviews.find((r) => r.user_id === user.id) ?? null : null;
  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
          <MessageCircle size={12} /> 후기 ({reviews.length})
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
            <Star size={10} fill="currentColor" />
            {avg.toFixed(1)}
          </div>
        )}
      </div>

      <ReviewForm placeId={placeId} myReview={myReview} loggedIn={Boolean(user)} />

      <div className="flex flex-col gap-2 mt-3">
        {reviews.length === 0 ? (
          <p className="text-[11px] text-zinc-400 text-center py-4">
            첫 번째 후기를 남겨보세요!
          </p>
        ) : (
          reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              isOwn={user?.id === review.user_id}
            />
          ))
        )}
      </div>
    </section>
  );
}
