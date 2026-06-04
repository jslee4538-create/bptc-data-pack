"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";

// 메신저/SNS 인앱 브라우저(웹뷰)에서는 Google OAuth가 차단됨(disallowed_useragent).
// 감지되면 외부 브라우저로 열도록 안내한다.
const IN_APP_PATTERNS =
  /KAKAOTALK|Instagram|FBAN|FBAV|FB_IAB|Line\/|NAVER|DaumApps|BAND|Snapchat|Twitter|everytimeApp|wadiz|inapp/i;

function detect(ua: string) {
  const isInApp = IN_APP_PATTERNS.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  return { isInApp, isAndroid, isIOS };
}

export default function InAppBrowserNotice() {
  const [info, setInfo] = useState<{
    isInApp: boolean;
    isAndroid: boolean;
    isIOS: boolean;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInfo(detect(navigator.userAgent || ""));
  }, []);

  if (!info?.isInApp || dismissed) return null;

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  // 안드로이드: Chrome intent 스킴으로 외부 브라우저 탈출
  const openExternal = () => {
    if (info.isAndroid) {
      const bare = currentUrl.replace(/^https?:\/\//, "");
      window.location.href = `intent://${bare}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    // iOS 등: 자동 탈출 불가 → URL 복사 후 안내
    copyUrl();
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="absolute inset-x-0 top-0 z-[60] p-3">
      <div className="rounded-2xl bg-zinc-900 text-white shadow-xl border border-white/10 p-3.5">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-xs font-extrabold">
              ⚠️ Google 로그인은 외부 브라우저에서만 돼요
            </p>
            <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
              카카오톡·인스타그램 등 앱 내 브라우저에서는 Google 보안 정책으로
              로그인이 막혀요.{" "}
              {info.isAndroid
                ? "아래 버튼으로 Chrome에서 열어주세요."
                : "우측 상단/하단 메뉴 → ‘Safari로 열기’를 누르거나, 주소를 복사해 브라우저에 붙여넣어 주세요."}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={openExternal}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold"
              >
                <ExternalLink size={12} />
                {info.isAndroid ? "Chrome으로 열기" : "주소 복사"}
              </button>
              {!info.isAndroid && (
                <button
                  onClick={copyUrl}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold"
                >
                  {copied ? "복사됨 ✓" : "주소 복사"}
                </button>
              )}
              {copied && info.isAndroid && (
                <span className="text-[11px] text-emerald-300 font-semibold">
                  복사됨 ✓
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="닫기"
            className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
