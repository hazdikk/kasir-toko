"use client";

import { useState, useEffect, useReducer } from "react";
import { getProducts } from "@/services/products";
import { createTransaction } from "@/services/transactions";
import { formatRupiah } from "@/lib/format";
import BarcodeScanner from "@/components/BarcodeScanner";
import type { Product, PaymentMethod, TransactionResponse } from "@/types";

// ─── Cart ─────────────────────────────────────────────────────────────────────

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

type CartAction =
  | { type: "ADD"; product: Product }
  | { type: "INCREMENT"; productId: string }
  | { type: "DECREMENT"; productId: string }
  | { type: "CLEAR" };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.productId === action.product.id);
      if (existing) {
        return state.map((i) =>
          i.productId === action.product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...state,
        {
          productId: action.product.id,
          productName: action.product.name,
          quantity: 1,
          unitPrice: action.product.price,
        },
      ];
    }
    case "INCREMENT":
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: i.quantity + 1 } : i,
      );
    case "DECREMENT":
      return state
        .map((i) =>
          i.productId === action.productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0);
    case "CLEAR":
      return [];
  }
}

// ─── Checkout Sheet ────────────────────────────────────────────────────────────

interface CheckoutSheetProps {
  cart: CartItem[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onClose: () => void;
  onSuccess: (transaction: TransactionResponse) => void;
}

function CheckoutSheet({
  cart,
  onIncrement,
  onDecrement,
  onClose,
  onSuccess,
}: CheckoutSheetProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const parsed = Number(amountPaid);
  const change = parsed - total;
  const canCheckout =
    cart.length > 0 && (paymentMethod === "CARD" || (parsed >= total && parsed > 0));

  async function handleCheckout() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await createTransaction({
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        amountPaid: paymentMethod === "CARD" ? total : parsed,
      });
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses transaksi.");
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-gray-500 active:bg-gray-100"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Keranjang</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-base text-gray-500">Keranjang kosong.</p>
          <p className="text-sm text-gray-400">Ketuk produk untuk menambahkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-gray-500 active:bg-gray-100"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Keranjang</h2>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100 px-4">
          {cart.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-gray-900">
                  {item.productName}
                </p>
                <p className="text-sm text-gray-500">{formatRupiah(item.unitPrice)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => onDecrement(item.productId)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-lg text-gray-700 active:bg-gray-100"
                >
                  −
                </button>
                <span className="w-6 text-center text-base font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onIncrement(item.productId)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-lg text-gray-700 active:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="w-24 shrink-0 text-right text-sm font-medium text-gray-900">
                {formatRupiah(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment */}
      <div className="space-y-4 border-t border-gray-200 bg-white px-4 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatRupiah(total)}</span>
        </div>

        <div className="flex gap-3">
          {(["CASH", "CARD"] as PaymentMethod[]).map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex-1 rounded-xl py-3 text-base font-medium ${
                paymentMethod === method
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 active:bg-gray-100"
              }`}
            >
              {method === "CASH" ? "Tunai" : "Kartu"}
            </button>
          ))}
        </div>

        {paymentMethod === "CASH" && (
          <div className="space-y-2">
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Jumlah bayar"
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {parsed >= total && parsed > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                <span className="text-sm text-green-700">Kembalian</span>
                <span className="text-base font-semibold text-green-700">
                  {formatRupiah(change)}
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={!canCheckout || submitting}
          className="w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white active:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Memproses…" : "Bayar"}
        </button>
      </div>
    </div>
  );
}

// ─── Receipt ──────────────────────────────────────────────────────────────────

interface ReceiptProps {
  transaction: TransactionResponse;
  onClose: () => void;
}

function Receipt({ transaction, onClose }: ReceiptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <div className="mb-4 text-center">
          <div className="mb-2 text-4xl">✅</div>
          <h2 className="text-lg font-bold text-gray-900">Transaksi Berhasil</h2>
          <p className="text-sm text-gray-500">
            {new Date(transaction.createdAt).toLocaleString("id-ID")}
          </p>
        </div>

        <ul className="mb-4 divide-y divide-gray-100 text-sm">
          {transaction.items.map((item) => (
            <li key={item.productId} className="flex justify-between py-2">
              <span className="text-gray-700">
                {item.productName} ×{item.quantity}
              </span>
              <span className="font-medium">{formatRupiah(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mb-1 flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatRupiah(transaction.totalAmount)}</span>
        </div>

        {transaction.paymentMethod === "CASH" && (
          <>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Bayar</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white active:bg-blue-700"
        >
          Transaksi Baru
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [receipt, setReceipt] = useState<TransactionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((data) => {
        if (!cancelled) { setProducts(data); setFetchError(null); }
      })
      .catch((err) => {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : "Gagal memuat produk.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refresh]);

  function refetch() {
    setLoading(true);
    setRefresh((n) => n + 1);
  }

  function handleScan(code: string) {
    setShowScanner(false);
    const product = products.find((p) => p.barcode === code);
    if (!product) {
      setScanFeedback({ message: `Produk tidak ditemukan: ${code}`, isError: true });
    } else if (product.stock === 0) {
      setScanFeedback({ message: `${product.name} — stok habis`, isError: true });
    } else {
      dispatch({ type: "ADD", product });
      setScanFeedback({ message: `${product.name} ditambahkan`, isError: false });
    }
    setTimeout(() => setScanFeedback(null), 2500);
  }

  function handleCheckoutSuccess(transaction: TransactionResponse) {
    setShowCheckout(false);
    setReceipt(transaction);
    dispatch({ type: "CLEAR" });
    refetch();
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Kasir</h1>
        <button
          onClick={() => setShowScanner(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-600 active:bg-gray-100"
          aria-label="Scan barcode"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
            <line x1="7" y1="8" x2="7" y2="16" strokeLinecap="round" />
            <line x1="10" y1="8" x2="10" y2="16" strokeLinecap="round" />
            <line x1="13" y1="8" x2="13" y2="16" strokeLinecap="round" />
            <line x1="16" y1="8" x2="16" y2="11" strokeLinecap="round" />
            <line x1="16" y1="13" x2="16" y2="16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {scanFeedback && (
        <div className={`px-4 py-3 text-sm font-medium text-white ${scanFeedback.isError ? "bg-red-500" : "bg-green-600"}`}>
          {scanFeedback.message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-500">Memuat…</div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-4 py-24 px-6 text-center">
          <p className="text-gray-600">{fetchError}</p>
          <button
            onClick={refetch}
            className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white active:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 pb-32">
          {products.map((product) => {
            const inCart = cart.find((i) => i.productId === product.id);
            const outOfStock = product.stock === 0;
            return (
              <li key={product.id}>
                <button
                  onClick={() => dispatch({ type: "ADD", product })}
                  disabled={outOfStock}
                  className="flex w-full items-center gap-3 bg-white px-4 py-4 text-left active:bg-blue-50 disabled:opacity-40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatRupiah(product.price)}
                      {outOfStock ? (
                        <span className="ml-2 text-red-400">Habis</span>
                      ) : (
                        <span className="text-gray-400"> · Stok: {product.stock}</span>
                      )}
                    </p>
                  </div>
                  {inCart && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {inCart.quantity}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Cart bar */}
      {cartCount > 0 && !showCheckout && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
          <button
            onClick={() => setShowCheckout(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-lg active:bg-blue-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {cartCount}
            </span>
            <span className="text-base font-semibold">Lihat Keranjang</span>
            <span className="text-base font-semibold">{formatRupiah(cartTotal)}</span>
          </button>
        </div>
      )}

      {showCheckout && (
        <CheckoutSheet
          cart={cart}
          onIncrement={(id) => dispatch({ type: "INCREMENT", productId: id })}
          onDecrement={(id) => dispatch({ type: "DECREMENT", productId: id })}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {receipt && <Receipt transaction={receipt} onClose={() => setReceipt(null)} />}

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
