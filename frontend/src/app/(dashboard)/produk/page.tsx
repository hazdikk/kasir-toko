"use client";

import { useState, useEffect, useRef } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  stockInProduct,
} from "@/services/products";
import { ApiException } from "@/services/api";
import { formatRupiah } from "@/lib/format";
import BarcodeScanner from "@/components/BarcodeScanner";
import type { Product, ProductRequest, StockInRequest } from "@/types";

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
      <line x1="7" y1="8" x2="7" y2="16" strokeLinecap="round" />
      <line x1="10" y1="8" x2="10" y2="16" strokeLinecap="round" />
      <line x1="13" y1="8" x2="13" y2="16" strokeLinecap="round" />
      <line x1="16" y1="8" x2="16" y2="11" strokeLinecap="round" />
      <line x1="16" y1="13" x2="16" y2="16" strokeLinecap="round" />
    </svg>
  );
}

function scanFeedbackToneClass(tone: "success" | "error" | "info") {
  if (tone === "success") return "bg-green-600";
  if (tone === "error") return "bg-red-500";
  return "bg-blue-600";
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: Product;
  onSave: (data: ProductRequest) => Promise<void>;
  onCancel: () => void;
}

function ProductForm({ initial, onSave, onCancel }: ProductFormProps) {
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [purchasePrice, setPurchasePrice] = useState(initial?.purchasePrice.toString() ?? "");
  const [sellingPrice, setSellingPrice] = useState(initial?.sellingPrice.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPurchasePrice = Number(purchasePrice);
    const parsedSellingPrice = Number(sellingPrice);
    const parsedStock = Number(stock);

    if (!name.trim()) return setError("Nama produk wajib diisi.");
    if (isNaN(parsedPurchasePrice) || parsedPurchasePrice <= 0) {
      return setError("Harga beli harus lebih dari 0.");
    }
    if (isNaN(parsedSellingPrice) || parsedSellingPrice <= 0) {
      return setError("Harga jual harus lebih dari 0.");
    }
    if (isNaN(parsedStock) || parsedStock < 0) return setError("Stok tidak boleh negatif.");

    setSaving(true);
    try {
      await onSave({
        barcode: barcode.trim() || undefined,
        name: name.trim(),
        purchasePrice: parsedPurchasePrice,
        sellingPrice: parsedSellingPrice,
        stock: parsedStock,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/40"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          {initial ? "Edit Produk" : "Tambah Produk"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Barcode <span className="font-normal text-gray-400">(opsional)</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Contoh: 8991234567890"
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-600 active:bg-gray-100"
                aria-label="Scan barcode"
              >
                <ScanIcon />
              </button>
            </div>
          </div>

          {showScanner && (
            <BarcodeScanner
              onScan={(code) => { setBarcode(code); setShowScanner(false); }}
              onClose={() => setShowScanner(false)}
            />
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Indomie Goreng"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Contoh: 3500"
              inputMode="numeric"
              min="1"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Harga Jual (Rp)</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="Contoh: 5000"
              inputMode="numeric"
              min="1"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Stok</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Contoh: 50"
              inputMode="numeric"
              min="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-base font-medium text-gray-700 active:bg-gray-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-medium text-white active:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteConfirmProps {
  product: Product;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

function DeleteConfirm({ product, onConfirm, onCancel }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus produk.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-base font-semibold text-gray-900">Hapus Produk?</h2>
        <p className="mb-5 text-sm text-gray-600">
          <span className="font-medium">{product.name}</span> akan dihapus secara permanen.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-gray-300 py-3 text-base font-medium text-gray-700 active:bg-gray-100 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-600 py-3 text-base font-medium text-white active:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface StockInFormProps {
  product: Product;
  onSave: (data: StockInRequest) => Promise<void>;
  onCancel: () => void;
}

function StockInForm({ product, onSave, onCancel }: StockInFormProps) {
  const [quantity, setQuantity] = useState("");
  const [unitPurchasePrice, setUnitPurchasePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedQuantity = Number(quantity);
    const parsedUnitPurchasePrice = Number(unitPurchasePrice);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Jumlah stok harus lebih dari 0.");
      return;
    }
    if (isNaN(parsedUnitPurchasePrice) || parsedUnitPurchasePrice <= 0) {
      setError("Harga beli satuan harus lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      await onSave({ quantity: parsedQuantity, unitPurchasePrice: parsedUnitPurchasePrice });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan stok.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/40"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Tambah Stok</h2>
        <p className="mb-1 text-base font-medium text-gray-900">{product.name}</p>
        <p className="mb-5 text-sm text-gray-500">
          Stok saat ini: {product.stock} · Harga beli: {formatRupiah(product.purchasePrice)}
          {product.barcode && <span className="text-gray-400"> · {product.barcode}</span>}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Jumlah stok</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Contoh: 5"
              inputMode="numeric"
              min="1"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Harga beli satuan (Rp)</label>
            <input
              type="number"
              value={unitPurchasePrice}
              onChange={(e) => setUnitPurchasePrice(e.target.value)}
              placeholder="Contoh: 13000"
              inputMode="numeric"
              min="1"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-base font-medium text-gray-700 active:bg-gray-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-medium text-white active:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Tambah Stok"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Modal =
  | { type: "create" }
  | { type: "edit"; product: Product }
  | { type: "delete"; product: Product }
  | { type: "stockIn"; product: Product }
  | null;

type BannerTone = "success" | "error" | "info";

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ tone: BannerTone; message: string } | null>(null);
  const pendingScanCodeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat produk.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) return;

    let cancelled = false;
    searchProducts(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setSearchResults(data);
          setSearchError(null);
          const pendingScanCode = pendingScanCodeRef.current;
          if (pendingScanCode && pendingScanCode.toLowerCase() === debouncedQuery.toLowerCase()) {
            const exactMatches = data.filter(
              (item) => item.barcode?.toLowerCase() === pendingScanCode.toLowerCase(),
            );
            if (exactMatches.length === 1) {
              setModal({ type: "stockIn", product: exactMatches[0] });
              showScanFeedback("success", `${exactMatches[0].name} dipilih untuk stock-in.`);
            } else if (exactMatches.length === 0) {
              showScanFeedback("error", `Produk tidak ditemukan: ${pendingScanCode}`);
            } else {
              showScanFeedback("info", "Ditemukan beberapa produk. Silakan pilih satu.");
            }
            pendingScanCodeRef.current = null;
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSearchError(err instanceof Error ? err.message : "Gagal mencari produk.");
          setSearchResults([]);
          if (pendingScanCodeRef.current) {
            showScanFeedback("error", "Barcode tidak dapat diproses.");
            pendingScanCodeRef.current = null;
          }
        }
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function refetch() {
    setLoading(true);
    setRefresh((n) => n + 1);
  }

  function showScanFeedback(tone: BannerTone, message: string) {
    setScanFeedback({ tone, message });
    setTimeout(() => setScanFeedback(null), 3000);
  }

  function mergeUpdatedProduct(updatedProduct: Product) {
    setProducts((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
    );
    setSearchResults((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
    );
  }

  async function handleCreate(data: ProductRequest) {
    await createProduct(data);
    setModal(null);
    refetch();
  }

  async function handleEdit(product: Product, data: ProductRequest) {
    await updateProduct(product.id, data);
    setModal(null);
    refetch();
  }

  async function handleDelete(product: Product) {
    await deleteProduct(product.id);
    setModal(null);
    refetch();
  }

  async function handleScan(code: string) {
    setShowScanner(false);
    const scannedCode = code.trim();
    if (!scannedCode) {
      showScanFeedback("error", "Barcode kosong.");
      return;
    }

    setQuery(scannedCode);
    setDebouncedQuery(scannedCode);
    setSearchError(null);
    setSearchLoading(true);
    pendingScanCodeRef.current = scannedCode;
  }

  async function handleStockIn(product: Product, data: StockInRequest) {
    try {
      const updatedProduct = await stockInProduct(product.id, data);
      mergeUpdatedProduct(updatedProduct);
      setModal(null);
      showScanFeedback("success", `Stok ${updatedProduct.name} berhasil ditambahkan.`);
      refetch();
    } catch (err) {
      if (err instanceof ApiException && err.status === 404) {
        throw new Error("Produk tidak ditemukan.");
      }
      throw err instanceof Error ? err : new Error("Gagal menambahkan stok.");
    }
  }

  const hasQuery = query.trim().length > 0;
  const visibleProducts = hasQuery ? searchResults : products;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Produk</h1>
      </div>

      <div className="space-y-3 border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              pendingScanCodeRef.current = null;
              setSearchError(null);
              if (!nextQuery.trim()) {
                setSearchResults([]);
                setSearchLoading(false);
                return;
              }
              setSearchLoading(true);
            }}
            placeholder="Cari nama produk atau barcode"
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={() => setShowScanner(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-600 active:bg-gray-100"
            aria-label="Scan barcode"
          >
            <ScanIcon />
          </button>
          <button
            onClick={() => setModal({ type: "create" })}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white active:bg-blue-700"
            aria-label="Tambah produk"
          >
            +
          </button>
        </div>

        {hasQuery && searchLoading && <p className="text-sm text-gray-500">Mencari…</p>}
        {hasQuery && searchError && <p className="text-sm text-red-600">{searchError}</p>}
      </div>

      {scanFeedback && (
        <div
          className={`px-4 py-3 text-sm font-medium text-white ${scanFeedbackToneClass(scanFeedback.tone)}`}
        >
          {scanFeedback.message}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-gray-500">
          Memuat…
        </div>
      ) : !hasQuery && error ? (
        <div className="flex flex-col items-center gap-4 py-24 px-6 text-center">
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refetch}
            className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white active:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 px-6 text-center">
          {hasQuery ? (
            <p className="text-base text-gray-500">Produk tidak ditemukan.</p>
          ) : (
            <>
              <p className="text-base text-gray-500">Belum ada produk.</p>
              <p className="text-sm text-gray-400">Ketuk + untuk menambahkan produk pertama.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 pb-20">
          {visibleProducts.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-3 bg-white px-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  Beli: {formatRupiah(product.purchasePrice)} · Jual: {formatRupiah(product.sellingPrice)} · Stok: {product.stock}
                  {product.barcode && <span className="text-gray-400"> · {product.barcode}</span>}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setModal({ type: "stockIn", product })}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 active:bg-gray-100"
                >
                  Tambah Stok
                </button>
                <button
                  onClick={() => setModal({ type: "edit", product })}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-base text-gray-600 active:bg-gray-100"
                  aria-label={`Edit ${product.name}`}
                >
                  ✏️
                </button>
                <button
                  onClick={() => setModal({ type: "delete", product })}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 text-base text-red-500 active:bg-red-50"
                  aria-label={`Hapus ${product.name}`}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal?.type === "create" && (
        <ProductForm
          onSave={handleCreate}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "edit" && (
        <ProductForm
          initial={modal.product}
          onSave={(data) => handleEdit(modal.product, data)}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteConfirm
          product={modal.product}
          onConfirm={() => handleDelete(modal.product)}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "stockIn" && (
        <StockInForm
          product={modal.product}
          onSave={(data) => handleStockIn(modal.product, data)}
          onCancel={() => setModal(null)}
        />
      )}

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
