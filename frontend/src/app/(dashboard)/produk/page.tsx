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
import type { Product, ProductRequest } from "@/types";

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
        className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+4rem+env(safe-area-inset-bottom))]"
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

// ─── Main Page ────────────────────────────────────────────────────────────────

type Modal =
  | { type: "create" }
  | { type: "edit"; product: Product }
  | { type: "delete"; product: Product }
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unitPurchasePrice, setUnitPurchasePrice] = useState("");
  const [stockInSaving, setStockInSaving] = useState(false);
  const [stockInError, setStockInError] = useState<string | null>(null);
  const [stockInSuccess, setStockInSuccess] = useState<string | null>(null);
  const pendingScanCodeRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setError(null);
          setSelectedProductId((currentId) => {
            if (!currentId) return null;
            const exists = data.some((item) => item.id === currentId);
            if (exists) return currentId;
            setSelectionWarning("Produk terpilih tidak ditemukan lagi. Silakan pilih ulang.");
            setStockInError(null);
            setStockInSuccess(null);
            setQuantity("");
            setUnitPurchasePrice("");
            return null;
          });
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
              setSelectedProductId(exactMatches[0].id);
              setSelectionWarning(null);
              showScanFeedback("success", `${exactMatches[0].name} dipilih.`);
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

  function handleSelectProduct(productId: string) {
    setSelectedProductId(productId);
    setSelectionWarning(null);
    setStockInError(null);
    setStockInSuccess(null);
  }

  async function handleStockInSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStockInError(null);
    setStockInSuccess(null);

    if (!selectedProductId) {
      setStockInError("Pilih produk terlebih dahulu.");
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitPurchasePrice = Number(unitPurchasePrice);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setStockInError("Jumlah stok harus lebih dari 0.");
      return;
    }
    if (isNaN(parsedUnitPurchasePrice) || parsedUnitPurchasePrice <= 0) {
      setStockInError("Harga beli satuan harus lebih dari 0.");
      return;
    }

    setStockInSaving(true);
    try {
      const updatedProduct = await stockInProduct(selectedProductId, {
        quantity: parsedQuantity,
        unitPurchasePrice: parsedUnitPurchasePrice,
      });
      setProducts((prev) =>
        prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
      );
      setSearchResults((prev) =>
        prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
      );
      setSelectedProductId(updatedProduct.id);
      setStockInSuccess(`Stok ${updatedProduct.name} berhasil ditambahkan.`);
      setQuantity("");
      setUnitPurchasePrice("");
      refetch();
    } catch (err) {
      if (err instanceof ApiException && err.status === 404) {
        setStockInError("Produk tidak ditemukan.");
      } else {
        setStockInError(err instanceof Error ? err.message : "Gagal menambahkan stok.");
      }
    } finally {
      setStockInSaving(false);
    }
  }

  const selectedProduct =
    searchResults.find((item) => item.id === selectedProductId) ??
    products.find((item) => item.id === selectedProductId) ??
    null;
  const hasQuery = query.trim().length > 0;
  const visibleProducts = hasQuery ? searchResults : products;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Produk</h1>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-xl text-white active:bg-blue-700"
          aria-label="Tambah produk"
        >
          +
        </button>
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

        {hasQuery && searchLoading && <p className="text-sm text-gray-500">Mencari…</p>}
        {hasQuery && searchError && <p className="text-sm text-red-600">{searchError}</p>}
      </div>

      {scanFeedback && (
        <div
          className={`px-4 py-3 text-sm font-medium text-white ${
            scanFeedback.tone === "success"
              ? "bg-green-600"
              : scanFeedback.tone === "error"
                ? "bg-red-500"
                : "bg-blue-600"
          }`}
        >
          {scanFeedback.message}
        </div>
      )}

      <div className="space-y-3 border-b border-gray-200 bg-gray-50 px-4 py-4">
        <h2 className="text-base font-semibold text-gray-900">Stock-In</h2>
        {selectionWarning && (
          <p className="rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">{selectionWarning}</p>
        )}

        {selectedProduct ? (
          <>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-base font-medium text-gray-900">{selectedProduct.name}</p>
              <p className="mt-1 text-sm text-gray-500">
                Stok saat ini: {selectedProduct.stock} · Harga beli: {formatRupiah(selectedProduct.purchasePrice)}
                {selectedProduct.barcode && <span className="text-gray-400"> · {selectedProduct.barcode}</span>}
              </p>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Jumlah stok</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Contoh: 5"
                  inputMode="numeric"
                  min="1"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {stockInError && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{stockInError}</p>
              )}
              {stockInSuccess && (
                <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{stockInSuccess}</p>
              )}

              <button
                type="submit"
                disabled={stockInSaving}
                className="w-full rounded-xl bg-blue-600 py-3 text-base font-medium text-white active:bg-blue-700 disabled:opacity-50"
              >
                {stockInSaving ? "Menyimpan…" : "Tambah Stok"}
              </button>
            </form>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-500">
            Cari lalu pilih produk untuk menambah stok.
          </p>
        )}
      </div>

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
                  onClick={() => handleSelectProduct(product.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium active:bg-gray-100 ${
                    selectedProductId === product.id
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {selectedProductId === product.id ? "Dipilih" : "Pilih"}
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

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
