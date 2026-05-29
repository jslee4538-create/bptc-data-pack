import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PWARegister from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "교토 여가 가이드 - Kyoto Leisure Guide",
  description: "교토 교환학생을 위한 최고의 여가 명소, 맛집, 축제 캘린더 및 버스 동선 가이드",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Kyoto Guide",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex items-center justify-center p-0 md:p-4 overflow-hidden relative">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Decorative Blurred Background Blobs (for desktop) */}
          <div className="hidden md:block absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-rose-400/10 blur-[100px] pointer-events-none -z-10" />
          <div className="hidden md:block absolute bottom-[15%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-orange-400/10 blur-[120px] pointer-events-none -z-10" />

          {/* High-Fidelity Mobile Frame Container */}
          <div className="relative w-full max-w-md h-screen md:h-[840px] md:max-h-[90vh] bg-white dark:bg-zinc-900 md:rounded-[40px] md:shadow-2xl md:border-[10px] md:border-zinc-800 dark:md:border-zinc-800/80 overflow-hidden flex flex-col">
            {/* Top Notch/Speaker Detail for Phone Frame on Desktop */}
            <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-800 rounded-b-2xl z-50 items-center justify-center">
              <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* App Header */}
            <Header />

            {/* Scrollable Main Workspace */}
            <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 flex flex-col relative scrollbar-none pb-4">
              {children}
            </main>

            {/* App Bottom Navigation */}
            <BottomNav />
          </div>
          <PWARegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
