import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BookmarkButton from "@/components/BookmarkButton";
import PlaceCard from "@/components/PlaceCard";
import type { Category, Event, Place } from "@/types/database";
import { formatDateRange, formatSeason, gradientFor, seasonClass } from "@/lib/utils";

export const revalidate = 60;

type Params = Promise<{ id: string }>;

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, place:places(*, category:categories(*))")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const typed = event as Event & {
    place: (Place & { category: Category | null }) | null;
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div
        className={`relative h-48 bg-gradient-to-br ${gradientFor(typed.id)} flex items-center justify-center`}
      >
        {typed.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typed.image_url}
            alt={typed.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl drop-shadow-md">🎏</span>
        )}
        <Link
          href="/events"
          className="absolute top-3 left-3 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 shadow-md hover:bg-white"
          aria-label="캘린더로"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="absolute top-3 right-3">
          <BookmarkButton targetType="event" targetId={typed.id} variant="icon" />
        </div>
      </div>

      <section className="px-4">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${seasonClass(
            typed.season
          )}`}
        >
          {formatSeason(typed.season)}
        </span>
        <h1 className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {typed.title}
        </h1>
        <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
          <CalendarDays size={12} />
          <span>{formatDateRange(typed.start_date, typed.end_date)}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          {typed.description}
        </p>
      </section>

      <section className="px-4">
        <BookmarkButton targetType="event" targetId={typed.id} />
      </section>

      {typed.place && (
        <section className="px-4">
          <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-1">
            <MapPin size={12} /> 행사 장소
          </h2>
          <PlaceCard place={typed.place} />
        </section>
      )}
    </div>
  );
}
