"use client";

import { useState } from "react";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GOOGLE_OAUTH_OPTIONS, callbackUrl } from "@/lib/auth";

type Props = {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (inclusive)
  location?: string | null;
};

type Result =
  | { ok: true; htmlLink?: string }
  | { ok: false; message: string };

function addOneDay(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().split("T")[0];
}

export default function AddToCalendarButton({
  title,
  description,
  startDate,
  endDate,
  location,
}: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const reauthorize = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        ...GOOGLE_OAUTH_OPTIONS,
        redirectTo: callbackUrl(
          window.location.origin,
          window.location.pathname
        ),
      },
    });
  };

  const handleClick = async () => {
    setResult(null);
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        await reauthorize();
        return;
      }
      const token = session.provider_token;
      if (!token) {
        // 로그인은 됐지만 calendar.events scope 미보유 → 재인증 유도
        setResult({
          ok: false,
          message: "캘린더 권한이 없어요. 다시 로그인하면 권한 동의 화면이 떠요.",
        });
        return;
      }

      const body = {
        summary: title,
        description,
        location: location ?? undefined,
        start: { date: startDate, timeZone: "Asia/Tokyo" },
        end: { date: addOneDay(endDate), timeZone: "Asia/Tokyo" }, // all-day: end is exclusive
        reminders: { useDefault: true },
      };

      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("calendar insert failed", res.status, errText);
        if (res.status === 401 || res.status === 403) {
          setResult({
            ok: false,
            message: "권한이 만료됐어요. 다시 로그인해주세요.",
          });
        } else {
          setResult({ ok: false, message: "캘린더에 추가하지 못했어요" });
        }
        return;
      }

      const json = (await res.json()) as { htmlLink?: string };
      setResult({ ok: true, htmlLink: json.htmlLink });
    } catch (err) {
      console.error(err);
      setResult({ ok: false, message: "오류가 발생했어요" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg disabled:opacity-60 transition-all active:scale-[0.98]"
      >
        <CalendarPlus size={14} />
        {loading ? "추가 중…" : "Google Calendar에 추가"}
      </button>
      {result?.ok && (
        <div className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
          Google Calendar에 추가됐어요
          {result.htmlLink && (
            <a
              href={result.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-0.5"
            >
              열기 <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}
      {result && !result.ok && (
        <button
          onClick={reauthorize}
          className="text-[11px] text-center text-rose-500 hover:underline"
        >
          {result.message} (다시 로그인)
        </button>
      )}
    </div>
  );
}
