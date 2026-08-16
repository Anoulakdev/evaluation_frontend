import type { Metadata } from "next";
import { Noto_Sans_Lao, Inter } from "next/font/google";
import "./globals.css";

const notoSansLao = Noto_Sans_Lao({
  variable: "--font-noto-sans-lao",
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDL Evaluation System | ລະບົບປະເມີນຜົນການປະຕິບັດງານ",
  description: "ລະບົບປະເມີນຜົນການປະຕິບັດງານ ລັດວິສາຫະກິດໄຟຟ້າລາວ (Electricite du Laos)",
  icons: {
    icon: [
      { url: "/edl.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: "/edl.png?v=2",
    apple: "/edl.png?v=2",
  },
};

import { ToastProvider } from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="lo"
      className={`${notoSansLao.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/edl.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/edl.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/edl.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
