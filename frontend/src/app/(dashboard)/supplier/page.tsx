"use client";

import { useEffect, useState } from "react";
import SupplierForm from "@/components/SupplierForm";
import { createSupplier, getSuppliers, searchSuppliers } from "@/services/suppliers";
import type { Supplier, SupplierRequest } from "@/types";

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <li className="bg-white px-4 py-4">
      <p className="truncate text-base font-medium text-gray-900">{supplier.companyName}</p>
      <p className="mt-1 text-sm text-gray-500">
        {supplier.senderName} · {supplier.phoneNumber}
      </p>
    </li>
  );
}

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Supplier[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSuppliers()
      .then((data) => {
        if (!cancelled) {
          setSuppliers(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat supplier.");
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
    searchSuppliers(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setSearchResults(data);
          setSearchError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSearchError(err instanceof Error ? err.message : "Gagal mencari supplier.");
          setSearchResults([]);
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
    setRefresh((value) => value + 1);
  }

  async function handleCreate(data: SupplierRequest) {
    const supplier = await createSupplier(data);
    setSuppliers((current) => [supplier, ...current]);
    setSearchResults((current) => (debouncedQuery ? [supplier, ...current] : current));
    setShowCreateForm(false);
    refetch();
  }

  const hasQuery = query.trim().length > 0;
  const visibleSuppliers = hasQuery ? searchResults : suppliers;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Supplier</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white active:bg-blue-700"
          aria-label="Tambah supplier"
        >
          +
        </button>
      </div>

      <div className="space-y-3 border-b border-gray-200 bg-white px-4 py-4">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            setQuery(nextQuery);
            setSearchError(null);
            if (!nextQuery.trim()) {
              setSearchResults([]);
              setSearchLoading(false);
              return;
            }
            setSearchLoading(true);
          }}
          placeholder="Cari perusahaan atau pengirim"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {hasQuery && searchLoading && <p className="text-sm text-gray-500">Mencari...</p>}
        {hasQuery && searchError && <p className="text-sm text-red-600">{searchError}</p>}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-gray-500">
          Memuat...
        </div>
      ) : !hasQuery && error ? (
        <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refetch}
            className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white active:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      ) : visibleSuppliers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
          {hasQuery ? (
            <>
              <p className="text-base text-gray-500">Supplier tidak ditemukan.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-medium text-white active:bg-blue-700"
              >
                Tambah Supplier
              </button>
            </>
          ) : (
            <>
              <p className="text-base text-gray-500">Belum ada supplier.</p>
              <p className="text-sm text-gray-400">Ketuk + untuk menambahkan supplier pertama.</p>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 pb-20">
          {visibleSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </ul>
      )}

      {showCreateForm && (
        <SupplierForm
          initialCompanyName={query.trim()}
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
