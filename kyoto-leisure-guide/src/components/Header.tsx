"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { LogIn, LogOut, Search, Sparkles, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("App");
  const tCommon = useTranslations("Common");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-lg border-b border-zinc-200/30 dark:border-zinc-800/30 px-5 py-3">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <span className="text-[9px] font-semibold text-rose-500 bg-rose-500/5 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              {t("subtitle")}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label={tCommon("search")}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors"
          >
            <Search size={16} />
          </Link>
          <LanguageSwitcher />
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                title={tCommon("logout")}
                aria-label={tCommon("logout")}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.email || "사용자"}
                  className="w-8 h-8 rounded-full border border-rose-500/25 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <User size={16} />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-95"
            >
              <LogIn size={13} />
              {tCommon("login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
