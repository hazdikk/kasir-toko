"use client";

import { useState, useEffect, useRef } from "react";
import {
  getProducts,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  stockInProduct,
} from "@/services/products";
import { ApiException } from "@/services/api";
import { createSupplier, searchSuppliers } from "@/services/suppliers";
import { formatRupiah } from "@/lib/format";
import BarcodeScanner from "@/components/BarcodeScanner";
import SupplierForm from "@/components/SupplierForm";
import type { Product, ProductRequest, StockInRequest, Supplier, SupplierRequest } from "@/types";

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
  categories: string[];
  categoriesError: string | null;
  onSave: (data: ProductRequest) => Promise<void>;
  onDelete?: () => void;
  onCancel: () => void;
}

function ProductForm({ initial, categories, categoriesError, onSave, onDelete, onCancel }: ProductFormProps) {
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [purchasePrice, setPurchasePrice] = useState(initial?.purchasePrice.toString() ?? "");
  const [sellingPrice, setSellingPrice] = useState(initial?.sellingPrice.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock.toString() ?? "");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const normalizedCategory = category.trim().toLowerCase();
  const categorySuggestions = categories.filter((item) =>
    item.toLowerCase().includes(normalizedCategory),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPurchasePrice = Number(purchasePrice);
    const parsedSellingPrice = Number(sellingPrice);
    const parsedStock = Number(stock);

    if (!name.trim()) return setError("Nama produk wajib diisi.");
    if (!category.trim()) return setError("Kategori wajib diisi.");
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
        category: category.trim(),
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
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? "Edit Produk" : "Tambah Produk"}
          </h2>
          {initial && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-base text-red-600 active:bg-red-100"
              aria-label={`Hapus ${initial.name}`}
            >
              🗑️
            </button>
          )}
        </div>

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
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <div className="relative">
              <input
                type="text"
                value={category}
                onFocus={() => setShowCategorySuggestions(true)}
                onBlur={() => {
                  window.setTimeout(() => setShowCategorySuggestions(false), 100);
                }}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setShowCategorySuggestions(true);
                }}
                placeholder="Contoh: Snack"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              {showCategorySuggestions && categorySuggestions.length > 0 && (
                <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-10 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  {categorySuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setCategory(item);
                        setShowCategorySuggestions(false);
                      }}
                      className="block min-h-11 w-full px-4 py-3 text-left text-base text-gray-700 active:bg-gray-100"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {categoriesError ? (
              <p className="text-sm text-amber-600">{categoriesError}</p>
            ) : categories.length > 0 ? (
              <p className="text-sm text-gray-500">Pilih kategori yang sudah ada atau ketik kategori baru.</p>
            ) : (
              <p className="text-sm text-gray-500">Belum ada kategori tersimpan. Ketik kategori baru untuk produk ini.</p>
            )}
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
  const [supplierQuery, setSupplierQuery] = useState("");
  const [debouncedSupplierQuery, setDebouncedSupplierQuery] = useState("");
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSupplierQuery(supplierQuery.trim());
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [supplierQuery]);

  useEffect(() => {
    if (!debouncedSupplierQuery) return;

    let cancelled = false;
    searchSuppliers(debouncedSupplierQuery)
      .then((data) => {
        if (!cancelled) {
          setSupplierResults(data);
          setSupplierError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSupplierError(err instanceof Error ? err.message : "Gagal mencari supplier.");
          setSupplierResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSupplierLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSupplierQuery]);

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
    if (!selectedSupplier) {
      setError("Supplier wajib dipilih.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        quantity: parsedQuantity,
        unitPurchasePrice: parsedUnitPurchasePrice,
        supplierId: selectedSupplier.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan stok.");
      setSaving(false);
    }
  }

  function handleSupplierQueryChange(value: string) {
    setSupplierQuery(value);
    setSelectedSupplier(null);
    setSupplierError(null);
    if (!value.trim()) {
      setSupplierResults([]);
      setSupplierLoading(false);
      return;
    }
    setSupplierLoading(true);
  }

  function handleSelectSupplier(supplier: Supplier) {
    setSelectedSupplier(supplier);
    setSupplierQuery(supplier.companyName);
    setSupplierResults([]);
    setSupplierError(null);
  }

  async function handleCreateSupplier(data: SupplierRequest) {
    const supplier = await createSupplier(data);
    handleSelectSupplier(supplier);
    setShowCreateSupplier(false);
  }

  const canCreateSupplier = supplierQuery.trim().length > 0 && !selectedSupplier;

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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Supplier</label>
            <input
              type="text"
              value={supplierQuery}
              onChange={(e) => handleSupplierQueryChange(e.target.value)}
              placeholder="Cari perusahaan atau pengirim"
              autoComplete="off"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {selectedSupplier && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-900">{selectedSupplier.companyName}</p>
                <p className="text-sm text-blue-700">
                  {selectedSupplier.senderName} · {selectedSupplier.phoneNumber}
                </p>
              </div>
            )}

            {supplierLoading && <p className="text-sm text-gray-500">Mencari...</p>}
            {supplierError && <p className="text-sm text-red-600">{supplierError}</p>}

            {!selectedSupplier && supplierResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white py-2">
                {supplierResults.map((supplier) => (
                  <button
                    key={supplier.id}
                    type="button"
                    onClick={() => handleSelectSupplier(supplier)}
                    className="block min-h-11 w-full px-4 py-3 text-left active:bg-gray-100"
                  >
                    <span className="block text-base font-medium text-gray-900">
                      {supplier.companyName}
                    </span>
                    <span className="block text-sm text-gray-500">
                      {supplier.senderName} · {supplier.phoneNumber}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {canCreateSupplier && !supplierLoading && (
              <button
                type="button"
                onClick={() => setShowCreateSupplier(true)}
                className="min-h-11 rounded-xl border border-blue-200 px-4 py-3 text-left text-base font-medium text-blue-700 active:bg-blue-50"
              >
                Tambah Supplier
              </button>
            )}
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
              disabled={saving || !selectedSupplier}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-medium text-white active:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Tambah Stok"}
            </button>
          </div>
        </form>
      </div>

      {showCreateSupplier && (
        <SupplierForm
          initialCompanyName={supplierQuery.trim()}
          onSave={handleCreateSupplier}
          onCancel={() => setShowCreateSupplier(false)}
        />
      )}
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
const PRODUCT_PAGE_SIZE = 25;

function compareProductNames(left: Product, right: Product) {
  return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
}

function insertSortedByName(
  products: Product[],
  product: Product,
  hasMoreProductsAfterLoadedRange: boolean,
) {
  const productsWithoutDuplicate = products.filter((item) => item.id !== product.id);
  const lastLoadedProduct = productsWithoutDuplicate.at(-1);

  if (
    hasMoreProductsAfterLoadedRange &&
    lastLoadedProduct &&
    compareProductNames(product, lastLoadedProduct) > 0
  ) {
    return productsWithoutDuplicate;
  }

  const insertIndex = productsWithoutDuplicate.findIndex(
    (item) => compareProductNames(product, item) <= 0,
  );

  if (insertIndex === -1) {
    return [...productsWithoutDuplicate, product];
  }

  return [
    ...productsWithoutDuplicate.slice(0, insertIndex),
    product,
    ...productsWithoutDuplicate.slice(insertIndex),
  ];
}

function productMatchesQuery(product: Product, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return false;

  return (
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.barcode?.toLowerCase().includes(normalizedQuery) === true
  );
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nextProductPage, setNextProductPage] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
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

    getProductCategories()
      .then((data) => {
        if (!cancelled) {
          setProductCategories(data);
          setCategoryError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCategoryError(err instanceof Error ? err.message : "Gagal memuat daftar kategori.");
          setProductCategories([]);
        }
      });

    getProducts({ page: 0, size: PRODUCT_PAGE_SIZE })
      .then((data) => {
        if (!cancelled) {
          setProducts(data.content);
          setNextProductPage(data.page + 1);
          setHasMoreProducts(!data.last);
          setError(null);
          setLoadMoreError(null);
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
    setLoadingMoreProducts(false);
    setProducts([]);
    setNextProductPage(0);
    setHasMoreProducts(false);
    setLoadMoreError(null);
    setRefresh((n) => n + 1);
  }

  async function handleLoadMoreProducts() {
    setLoadingMoreProducts(true);
    setLoadMoreError(null);
    try {
      const data = await getProducts({ page: nextProductPage, size: PRODUCT_PAGE_SIZE });
      setProducts((prev) => [...prev, ...data.content]);
      setNextProductPage(data.page + 1);
      setHasMoreProducts(!data.last);
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : "Gagal memuat produk.");
    } finally {
      setLoadingMoreProducts(false);
    }
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
      productMatchesQuery(updatedProduct, query)
        ? prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
        : prev.filter((item) => item.id !== updatedProduct.id),
    );
  }

  function insertProductInLoadedRange(createdProduct: Product) {
    setProducts((prev) => insertSortedByName(prev, createdProduct, hasMoreProducts));
    setSearchResults((prev) =>
      productMatchesQuery(createdProduct, query)
        ? insertSortedByName(prev, createdProduct, false)
        : prev,
    );
  }

  function removeProduct(productId: string) {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setSearchResults((prev) => prev.filter((item) => item.id !== productId));
  }

  function shouldRefreshCategories(previousCategory: string | undefined, nextCategory: string) {
    const normalizedNextCategory = nextCategory.trim().toUpperCase();
    const normalizedPreviousCategory = previousCategory?.trim().toUpperCase();
    const categoryExists = productCategories.some(
      (category) => category.trim().toUpperCase() === normalizedNextCategory,
    );

    if (normalizedPreviousCategory === undefined) {
      return !categoryExists;
    }

    return normalizedNextCategory !== normalizedPreviousCategory;
  }

  async function refreshProductCategories() {
    try {
      const categories = await getProductCategories();
      setProductCategories(categories);
      setCategoryError(null);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : "Gagal memuat daftar kategori.");
    }
  }

  async function handleCreate(data: ProductRequest) {
    const createdProduct = await createProduct(data);
    insertProductInLoadedRange(createdProduct);
    setModal(null);
    if (shouldRefreshCategories(undefined, createdProduct.category)) {
      await refreshProductCategories();
    }
  }

  async function handleEdit(product: Product, data: ProductRequest) {
    const updatedProduct = await updateProduct(product.id, data);
    mergeUpdatedProduct(updatedProduct);
    setModal(null);
    if (shouldRefreshCategories(product.category, updatedProduct.category)) {
      await refreshProductCategories();
    }
  }

  async function handleDelete(product: Product) {
    await deleteProduct(product.id);
    removeProduct(product.id);
    setModal(null);
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
    } catch (err) {
      if (err instanceof ApiException && err.status === 404) {
        throw new Error(err.message.includes("Supplier") ? "Supplier tidak ditemukan." : "Produk tidak ditemukan.");
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
        <>
          <ul className="divide-y divide-gray-100 pb-4">
            {visibleProducts.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-2 bg-white px-4 py-4"
              >
                <p className="text-base font-medium text-gray-900">{product.name}</p>

                <div className="flex items-start gap-3">
                  <p className="min-w-0 flex-1 text-sm text-gray-500">
                    Kategori: {product.category} ·{" "}
                    Beli: {formatRupiah(product.purchasePrice)} · Jual: {formatRupiah(product.sellingPrice)} · Stok: {product.stock}
                    {product.barcode && <span className="text-gray-400"> · {product.barcode}</span>}
                  </p>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => setModal({ type: "stockIn", product })}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 text-base text-blue-600 active:bg-blue-50"
                      aria-label={`Tambah stok ${product.name}`}
                    >
                      📦
                    </button>
                    <button
                      onClick={() => setModal({ type: "edit", product })}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-base text-gray-600 active:bg-gray-100"
                      aria-label={`Edit ${product.name}`}
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {!hasQuery && hasMoreProducts && (
            <div className="px-4 pb-20 pt-2">
              {loadMoreError && (
                <p className="mb-3 text-center text-sm text-red-600">{loadMoreError}</p>
              )}
              <button
                onClick={handleLoadMoreProducts}
                disabled={loadingMoreProducts}
                className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 active:bg-gray-100 disabled:opacity-50"
              >
                {loadingMoreProducts ? "Memuat…" : "Muat lagi"}
              </button>
            </div>
          )}
        </>
      )}

      {modal?.type === "create" && (
        <ProductForm
          categories={productCategories}
          categoriesError={categoryError}
          onSave={handleCreate}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "edit" && (
        <ProductForm
          initial={modal.product}
          categories={productCategories}
          categoriesError={categoryError}
          onSave={(data) => handleEdit(modal.product, data)}
          onDelete={() => setModal({ type: "delete", product: modal.product })}
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
