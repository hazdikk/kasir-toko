"use client";

import { useState } from "react";
import type { SupplierRequest } from "@/types";

interface SupplierFormProps {
  initialCompanyName?: string;
  onSave: (data: SupplierRequest) => Promise<void>;
  onCancel: () => void;
}

export default function SupplierForm({
  initialCompanyName = "",
  onSave,
  onCancel,
}: SupplierFormProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [senderName, setSenderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) return setError("Nama perusahaan wajib diisi.");
    if (!senderName.trim()) return setError("Nama pengirim wajib diisi.");
    if (!phoneNumber.trim()) return setError("Nomor telepon wajib diisi.");

    setSaving(true);
    try {
      await onSave({
        companyName: companyName.trim(),
        senderName: senderName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan supplier.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-black/40"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
      role="presentation"
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-lg font-semibold text-gray-900">Tambah Supplier</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nama perusahaan</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Contoh: PT Sumber Makmur"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nama pengirim</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nomor telepon</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Contoh: 08123456789"
              inputMode="tel"
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
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
