"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Calendar, Bus, Heart } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "홈", path: "/", icon: Home },
    { name: "명소", path: "/places", icon: MapPin },
    { name: "캘린더", path: "/events", icon: Calendar },
    { name: "교통", path: "/bus", icon: Bus },
    { name: "북마크", path: "/bookmarks", icon: Heart },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-lg border-t border-zinc-200/30 dark:border-zinc-800/30 px-6 py-2 pb-safe-bottom">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 relative group"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-rose-500/10 text-rose-500 scale-110 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-100 group-hover:bg-zinc-100/50 dark:group-hover:bg-zinc-800/50"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${
                  isActive
                    ? "text-rose-500 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -top-1 w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
