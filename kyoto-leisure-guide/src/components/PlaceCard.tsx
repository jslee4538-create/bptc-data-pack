import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Place, Category } from "@/types/database";
import { formatPriceRange, gradientFor } from "@/lib/utils";

type Props = {
  place: Place & { category?: Category | null };
  compact?: boolean;
};

export default function PlaceCard({ place, compact = false }: Props) {
  const icon = place.category?.icon ?? "📍";
  const categoryName = place.category?.name ?? "장소";

  return (
    <Link
      href={`/places/${place.id}`}
      className="group block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all overflow-hidden active:scale-[0.98]"
    >
      <div
        className={`relative ${
          compact ? "h-24" : "h-32"
        } bg-gradient-to-br ${gradientFor(place.id)} flex items-center justify-center`}
      >
        {place.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.image_url}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl drop-shadow-sm">{icon}</span>
        )}
        <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {icon} {categoryName}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">
          {place.name}
        </h3>
        {place.name_ja && (
          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
            {place.name_ja}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
          <MapPin size={10} />
          <span className="line-clamp-1">{place.address}</span>
        </div>
        {!compact && place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 text-[10px] font-medium text-zinc-400">
          💴 {formatPriceRange(place.price_range)}
        </div>
      </div>
    </Link>
  );
}
