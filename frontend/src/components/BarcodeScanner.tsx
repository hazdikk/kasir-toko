"use client";

import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let stopped = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (stopped) return;

      scanner = new Html5Qrcode("barcode-scanner-container");

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 260, height: 260 } },
          (decodedText: string) => {
            if (!stopped) {
              stopped = true;
              scanner?.stop().catch(() => {});
              onScanRef.current(decodedText);
            }
          },
          () => {},
        );
        if (!stopped) setReady(true);
      } catch (err) {
        if (!stopped) {
          setError(
            err instanceof Error ? err.message : "Tidak dapat mengakses kamera.",
          );
        }
      }
    }

    start();

    return () => {
      stopped = true;
      scanner?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-white active:bg-white/10"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-white">Scan Barcode</h2>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div id="barcode-scanner-container" className="h-full w-full" />

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/70">Memuat kamera…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-white/80">{error}</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-white/20 px-6 py-3 text-base font-medium text-white active:bg-white/30"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {ready && !error && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-white/70">Arahkan kamera ke barcode produk</p>
        </div>
      )}
    </div>
  );
}
