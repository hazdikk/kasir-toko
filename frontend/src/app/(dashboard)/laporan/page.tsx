"use client";

import { useState, useEffect } from "react";
import { getTransactions } from "@/services/transactions";
import { formatRupiah } from "@/lib/format";
import type { TransactionResponse } from "@/types";

function TransactionCard({ transaction }: { transaction: TransactionResponse }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(transaction.createdAt).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const itemCount = transaction.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalProfit = transaction.items.reduce(
    (sum, item) => sum + (item.subtotal - item.unitPurchasePrice * item.quantity),
    0,
  );

  return (
    <li className="bg-white">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-gray-50"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-gray-900">{date}</p>
          <p className="text-sm text-gray-500">{itemCount} item · Tunai</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-semibold text-gray-900">
            {formatRupiah(transaction.totalAmount)}
          </p>
          <p className="text-xs text-gray-400">{expanded ? "▲" : "▼"}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <ul className="mb-3 space-y-2">
            {transaction.items.map((item) => (
              <li key={item.productId} className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    {item.productName} ×{item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>Laba item</span>
                  <span>
                    {formatRupiah(item.subtotal - item.unitPurchasePrice * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatRupiah(transaction.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Bayar</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Laba</span>
              <span>{formatRupiah(totalProfit)}</span>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function LaporanPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  function refetch() {
    setLoading(true);
    setRefresh((n) => n + 1);
  }

  useEffect(() => {
    let cancelled = false;
    getTransactions()
      .then((data) => {
        if (!cancelled) { setTransactions(data.slice().reverse()); setError(null); }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat laporan.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh]);

  return (
    <div className="flex flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Laporan</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-500">Memuat…</div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-24 px-6 text-center">
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refetch}
            className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white active:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 px-6 text-center">
          <p className="text-base text-gray-500">Belum ada transaksi.</p>
          <p className="text-sm text-gray-400">Transaksi akan muncul di sini setelah checkout.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}
    </div>
  );
}
