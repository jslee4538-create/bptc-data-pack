import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AddToCourseButton from "@/components/AddToCourseButton";
import BookmarkButton from "@/components/BookmarkButton";
import EventCard from "@/components/EventCard";
import NearbyBusSection from "@/components/NearbyBusSection";
import ReviewSection from "@/components/ReviewSection";
import type { Category, Event, Place } from "@/types/database";
import { formatPriceRange, gradientFor } from "@/lib/utils";

export const revalidate = 60;

type Params = Promise<{ id: string }>;

export default async function PlaceDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: place } = await supabase
    .from("places")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (!place) notFound();

  const typedPlace = place as Place & { category: Category | null };

  const { data: relatedEvents } = await supabase
    .from("events")
    .select("*")
    .eq("place_id", id)
    .order("start_date");

  const events = (relatedEvents ?? []) as Event[];
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    typedPlace.lng - 0.005
  }%2C${typedPlace.lat - 0.003}%2C${typedPlace.lng + 0.005}%2C${
    typedPlace.lat + 0.003
  }&layer=mapnik&marker=${typedPlace.lat}%2C${typedPlace.lng}`;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Hero image */}
      <div
        className={`relative h-56 bg-gradient-to-br ${gradientFor(
          typedPlace.id
        )} flex items-center justify-center`}
      >
        {typedPlace.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typedPlace.image_url}
            alt={typedPlace.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl drop-shadow-md">
            {typedPlace.category?.icon ?? "📍"}
          </span>
        )}
        <Link
          href="/places"
          className="absolute top-3 left-3 p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 shadow-md hover:bg-white"
          aria-label="목록으로"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="absolute top-3 right-3">
          <BookmarkButton targetType="place" targetId={typedPlace.id} variant="icon" />
        </div>
      </div>

      {/* Title block */}
      <section className="px-4">
        {typedPlace.category && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 px-2 py-1 rounded-full">
            {typedPlace.category.icon} {typedPlace.category.name}
          </span>
        )}
        <h1 className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          {typedPlace.name}
        </h1>
        {typedPlace.name_ja && (
          <p className="text-xs text-zinc-400 mt-0.5">{typedPlace.name_ja}</p>
        )}
        <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          {typedPlace.description}
        </p>

        {typedPlace.tags && typedPlace.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {typedPlace.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-rose-600 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Info */}
      <section className="px-4">
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 p-4 flex flex-col gap-3">
          <InfoRow icon={<MapPin size={14} />} label="주소" value={typedPlace.address} />
          {typedPlace.opening_hours && (
            <InfoRow
              icon={<Clock size={14} />}
              label="운영시간"
              value={typedPlace.opening_hours}
            />
          )}
          <InfoRow
            icon={<span>💴</span>}
            label="가격대"
            value={formatPriceRange(typedPlace.price_range)}
          />
        </div>
      </section>

      {/* Map */}
      <section className="px-4">
        <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
          지도
        </h2>
        <div className="rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-700 h-56 bg-zinc-100 dark:bg-zinc-800">
          <iframe
            title={`${typedPlace.name} 지도`}
            src={mapSrc}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
        <a
          href={`https://www.openstreetmap.org/?mlat=${typedPlace.lat}&mlon=${typedPlace.lng}#map=17/${typedPlace.lat}/${typedPlace.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-[10px] text-rose-500 text-right hover:underline"
        >
          OpenStreetMap에서 크게 보기 →
        </a>
      </section>

      {/* Bookmark + Course */}
      <section className="px-4 flex flex-col gap-2">
        <BookmarkButton targetType="place" targetId={typedPlace.id} />
        <AddToCourseButton placeId={typedPlace.id} />
      </section>

      {/* Nearby buses */}
      <NearbyBusSection lat={typedPlace.lat} lng={typedPlace.lng} />

      {/* Reviews */}
      <ReviewSection placeId={typedPlace.id} />

      {/* Related events */}
      {events.length > 0 && (
        <section className="px-4">
          <h2 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
            이곳에서 열리는 행사
          </h2>
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-zinc-400 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-200 mt-0.5 break-keep">
          {value}
        </p>
      </div>
    </div>
  );
}
