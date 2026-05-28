"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type BookmarkedEvent = {
  id: string;
  title: string;
  start_date: string;
};

const ENABLED_KEY = "kg.notif.enabled";
const SEEN_PREFIX = "kg.notif.seen.";
const TRIGGER_DAYS = [7, 1] as const;

function daysBetween(target: Date, now: Date): number {
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

function getSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function getInitialPermission(): NotificationPermission {
  if (!getSupported()) return "default";
  return Notification.permission;
}

function getInitialEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ENABLED_KEY) === "1";
}

export default function EventNotifications() {
  const supabase = createClient();
  const [permission, setPermission] = useState<NotificationPermission>(getInitialPermission);
  const [enabled, setEnabled] = useState<boolean>(getInitialEnabled);
  const [fired, setFired] = useState(0);
  const supported = getSupported();

  const fireForBookmarks = useCallback(async () => {
    if (typeof window === "undefined" || Notification.permission !== "granted") return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("target_id")
      .eq("user_id", user.id)
      .eq("target_type", "event");
    const eventIds = (bookmarks ?? []).map((b) => b.target_id);
    if (eventIds.length === 0) return;

    const { data: events } = await supabase
      .from("events")
      .select("id, title, start_date")
      .in("id", eventIds);

    const now = new Date();
    let count = 0;
    for (const ev of (events ?? []) as BookmarkedEvent[]) {
      const diff = daysBetween(new Date(ev.start_date), now);
      for (const trigger of TRIGGER_DAYS) {
        if (diff === trigger) {
          const key = `${SEEN_PREFIX}${ev.id}.${trigger}`;
          if (localStorage.getItem(key)) continue;
          new Notification(`D-${trigger} · ${ev.title}`, {
            body: `${ev.start_date} 시작 · 즐겨찾기한 행사`,
            tag: `${ev.id}-${trigger}`,
          });
          localStorage.setItem(key, "1");
          count++;
        }
      }
    }
    setFired(count);
  }, [supabase]);

  useEffect(() => {
    if (!supported) return;
    if (enabled && Notification.permission === "granted") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fireForBookmarks();
    }
  }, [supported, enabled, fireForBookmarks]);

  const enable = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
      setPermission(perm);
    }
    if (perm === "granted") {
      localStorage.setItem(ENABLED_KEY, "1");
      setEnabled(true);
      fireForBookmarks();
    }
  };

  const disable = () => {
    localStorage.setItem(ENABLED_KEY, "0");
    setEnabled(false);
  };

  if (!supported) {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="px-4">
        <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 p-3 flex items-start gap-3">
          <BellOff size={16} className="text-zinc-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-zinc-500 leading-5">
            브라우저 알림이 차단되어 있어요. 주소창의 자물쇠 아이콘에서 알림 권한을 허용으로
            바꾸면 즐겨찾기 행사 D-7/D-1 알림을 받을 수 있어요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 p-3">
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 p-2 rounded-xl ${
              enabled
                ? "bg-rose-500/10 text-rose-500"
                : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400"
            }`}
          >
            <Bell size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
              행사 D-7 / D-1 알림
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              즐겨찾기한 행사가 다가오면 브라우저로 알려드려요
            </p>
          </div>
          {enabled ? (
            <button
              onClick={disable}
              className="shrink-0 text-[10px] font-bold text-zinc-500 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              끄기
            </button>
          ) : (
            <button
              onClick={enable}
              className="shrink-0 text-[10px] font-bold text-white px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 active:scale-95"
            >
              켜기
            </button>
          )}
        </div>
        {fired > 0 && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Check size={10} />
            {fired}개 행사 알림을 보냈어요
          </div>
        )}
      </div>
    </div>
  );
}
