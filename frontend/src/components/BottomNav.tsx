"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mainItems = [
  { href: "/kasir", label: "Kasir", icon: "🛒" },
  { href: "/produk", label: "Produk", icon: "📦" },
  { href: "/laporan", label: "Laporan", icon: "📊" },
];

const supplierItem = { href: "/supplier", label: "Supplier", icon: "🏢" };

function navItemClass(isActive: boolean) {
  return `flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium active:text-blue-600 ${
    isActive ? "text-blue-600" : "text-gray-600"
  }`;
}

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const supplierActive = pathname.startsWith(supplierItem.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      {showMore && (
        <div className="absolute bottom-full right-2 mb-2 min-w-40 rounded-xl border border-gray-200 bg-white py-2 shadow-lg min-[360px]:hidden">
          <Link
            href={supplierItem.href}
            onClick={() => setShowMore(false)}
            className={`flex min-h-11 items-center gap-3 px-4 text-sm font-medium active:bg-gray-100 ${
              supplierActive ? "text-blue-600" : "text-gray-700"
            }`}
          >
            <span className="text-lg">{supplierItem.icon}</span>
            {supplierItem.label}
          </Link>
        </div>
      )}

      <div className="flex h-16 items-center pb-[env(safe-area-inset-bottom)]">
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setShowMore(false)}
            className={navItemClass(pathname.startsWith(item.href))}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <Link
          href={supplierItem.href}
          className={`${navItemClass(supplierActive)} hidden min-[360px]:flex`}
        >
          <span className="text-xl">{supplierItem.icon}</span>
          {supplierItem.label}
        </Link>

        <button
          type="button"
          onClick={() => setShowMore((value) => !value)}
          className={`${navItemClass(supplierActive)} min-[360px]:hidden`}
          aria-expanded={showMore}
          aria-label="Menu lainnya"
        >
          <span className="text-xl">⋯</span>
          Lainnya
        </button>
      </div>
    </nav>
  );
}
