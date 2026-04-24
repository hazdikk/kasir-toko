"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

interface ScannerControls {
  stop: () => void;
}

interface TorchMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface TorchMediaTrackConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [canUseTorch, setCanUseTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchError, setTorchError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let controls: ScannerControls | null = null;

    function getVideoTrack() {
      const stream = videoRef.current?.srcObject;
      if (!(stream instanceof MediaStream)) return null;
      return stream.getVideoTracks()[0] ?? null;
    }

    function updateTorchSupport() {
      const videoTrack = getVideoTrack();
      videoTrackRef.current = videoTrack;

      const capabilities = videoTrack?.getCapabilities() as
        | TorchMediaTrackCapabilities
        | undefined;

      setCanUseTorch(Boolean(capabilities?.torch));
    }

    function handleResult(text: string) {
      const code = text.trim();
      if (!code) return;

      stopped = true;
      controls?.stop();
      onScanRef.current(code);
    }

    async function start() {
      if (!videoRef.current) return;
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result) => {
            if (result && !stopped) {
              handleResult(result.getText());
            }
          },
        );
        if (!stopped) {
          updateTorchSupport();
          setReady(true);
        }
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
      videoTrackRef.current = null;
      controls?.stop();
    };
  }, []);

  async function handleToggleTorch() {
    const videoTrack = videoTrackRef.current;
    if (!videoTrack || !canUseTorch) return;

    const nextTorchOn = !torchOn;
    setTorchError(null);

    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: nextTorchOn } as TorchMediaTrackConstraintSet],
      });
      setTorchOn(nextTorchOn);
    } catch {
      setTorchError("Senter tidak dapat dinyalakan di perangkat ini.");
      setCanUseTorch(false);
      setTorchOn(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl text-white active:bg-white/10"
          aria-label="Tutup scanner"
        >
          ←
        </button>
        <h2 className="flex-1 text-base font-semibold text-white">Scan Barcode</h2>
        {canUseTorch && (
          <button
            onClick={handleToggleTorch}
            className={`min-h-11 rounded-xl px-4 text-sm font-semibold text-white active:bg-white/20 ${
              torchOn ? "bg-white/25" : "bg-white/10"
            }`}
            aria-pressed={torchOn}
          >
            {torchOn ? "Senter On" : "Senter"}
          </button>
        )}
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
          {torchError && (
            <p className="mt-2 text-sm text-white/60">{torchError}</p>
          )}
        </div>
      )}
    </div>
  );
}
