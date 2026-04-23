"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: { stop: () => void } | null = null;

    async function start() {
      if (!videoRef.current) return;
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result) => {
            if (result && !stopped) {
              stopped = true;
              controls?.stop();
              onScanRef.current(result.getText());
            }
          },
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
      controls?.stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-white active:bg-white/10"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-white">Scan Barcode</h2>
      </div>

      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
        />

        {/* Scan frame */}
        {ready && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-40 w-72">
              <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-sm border-l-4 border-t-4 border-white" />
              <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-sm border-r-4 border-t-4 border-white" />
              <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-sm border-b-4 border-l-4 border-white" />
              <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-sm border-b-4 border-r-4 border-white" />
            </div>
          </div>
        )}

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
