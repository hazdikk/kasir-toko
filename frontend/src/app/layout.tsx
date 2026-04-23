import type { Metadata } from "next";
import { Geist } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kasir Toko",
  description: "Aplikasi kasir untuk toko",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
