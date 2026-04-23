"use client";

import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/products";
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
  const [price, setPrice] = useState(initial?.price.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim()) return setError("Nama produk wajib diisi.");
    if (isNaN(parsedPrice) || parsedPrice <= 0) return setError("Harga harus lebih dari 0.");
    if (isNaN(parsedStock) || parsedStock < 0) return setError("Stok tidak boleh negatif.");

    setSaving(true);
    try {
      await onSave({ barcode: barcode.trim() || undefined, name: name.trim(), price: parsedPrice, stock: parsedStock });
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
            <label className="text-sm font-medium text-gray-700">Harga (Rp)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Contoh: 3500"
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

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((data) => { if (!cancelled) { setProducts(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat produk."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh]);

  function refetch() {
    setLoading(true);
    setRefresh((n) => n + 1);
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

  return (
    <div className="flex flex-col">
      {/* Header */}
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

      {/* Content */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-gray-500">
          Memuat…
        </div>
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
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 px-6 text-center">
          <p className="text-base text-gray-500">Belum ada produk.</p>
          <p className="text-sm text-gray-400">Ketuk + untuk menambahkan produk pertama.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 pb-20">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-3 bg-white px-4 py-4"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-base font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {formatRupiah(product.price)} · Stok: {product.stock}
                  {product.barcode && <span className="text-gray-400"> · {product.barcode}</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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

      {/* Modals */}
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
    </div>
  );
}
