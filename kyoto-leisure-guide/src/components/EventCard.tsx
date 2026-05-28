import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Event } from "@/types/database";
import { formatDateRange, formatSeason, gradientFor, seasonClass } from "@/lib/utils";

type Props = {
  event: Event;
  compact?: boolean;
};

export default function EventCard({ event, compact = false }: Props) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all overflow-hidden active:scale-[0.98]"
    >
      <div
        className={`relative ${
          compact ? "h-20" : "h-28"
        } bg-gradient-to-br ${gradientFor(event.id)} flex items-center justify-center`}
      >
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl drop-shadow-sm">🎏</span>
        )}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm bg-white/90 dark:bg-zinc-900/90 ${seasonClass(
            event.season
          )}`}
        >
          {formatSeason(event.season)}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
          <CalendarDays size={10} />
          <span>{formatDateRange(event.start_date, event.end_date)}</span>
        </div>
        {!compact && (
          <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </Link>
  );
}
