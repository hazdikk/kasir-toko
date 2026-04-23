import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
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
        <main className="flex-1 pb-16">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-gray-200 bg-white">
          <Link
            href="/kasir"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium text-gray-600 active:text-blue-600"
          >
            <span className="text-xl">🛒</span>
            Kasir
          </Link>
          <Link
            href="/produk"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium text-gray-600 active:text-blue-600"
          >
            <span className="text-xl">📦</span>
            Produk
          </Link>
          <Link
            href="/laporan"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium text-gray-600 active:text-blue-600"
          >
            <span className="text-xl">📊</span>
            Laporan
          </Link>
        </nav>
      </body>
    </html>
  );
}
