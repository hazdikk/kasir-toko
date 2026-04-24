"use client";

import type { Html5Qrcode } from "html5-qrcode";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

interface ScanBoxDimensions {
  width: number;
  height: number;
}

interface BarcodeMediaTrackCapabilities extends MediaTrackCapabilities {
  focusMode?: string[];
  torch?: boolean;
  zoom?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

interface BarcodeMediaTrackConstraintSet extends MediaTrackConstraintSet {
  focusMode?: string;
  torch?: boolean;
  zoom?: number;
}

const BARCODE_FORMATS = [
  "EAN_13",
  "EAN_8",
  "UPC_A",
  "UPC_E",
  "UPC_EAN_EXTENSION",
  "CODE_128",
] as const;

function getBarcodeScanBox(
  viewfinderWidth: number,
  viewfinderHeight: number,
): ScanBoxDimensions {
  const width = Math.min(Math.floor(viewfinderWidth * 0.88), 360);
  const height = Math.min(
    Math.max(Math.floor(viewfinderHeight * 0.22), 140),
    180,
  );

  return {
    width: Math.min(width, viewfinderWidth - 24),
    height: Math.min(height, viewfinderHeight - 24),
  };
}

function getIdealVideoConstraints(): MediaTrackConstraints {
  return {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };
}

function supportsFocusMode(
  capabilities: BarcodeMediaTrackCapabilities,
  focusMode: string,
) {
  return capabilities.focusMode?.includes(focusMode) === true;
}

function getModerateZoom(capabilities: BarcodeMediaTrackCapabilities) {
  const { zoom } = capabilities;

  if (!zoom || typeof zoom.min !== "number" || typeof zoom.max !== "number") {
    return null;
  }

  const preferredZoom = Math.max(zoom.min, Math.min(zoom.max, 1.5));
  return Number(preferredZoom.toFixed(2));
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const onScanRef = useRef(onScan);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [canUseTorch, setCanUseTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let stopped = false;

    async function start() {
      setCanUseTorch(false);
      setError(null);
      setIsProcessing(false);
      setIsTorchOn(false);
      setReady(false);

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      if (stopped) return;

      const formatsToSupport = BARCODE_FORMATS.map(
        (format) => Html5QrcodeSupportedFormats[format],
      );
      const scanner = new Html5Qrcode("barcode-scanner-container", {
        formatsToSupport,
        useBarCodeDetectorIfSupported: true,
        verbose: false,
      });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: { ideal: "environment" } },
          {
            fps: 18,
            qrbox: getBarcodeScanBox,
            disableFlip: true,
            videoConstraints: getIdealVideoConstraints(),
          },
          (decodedText: string) => {
            if (!stopped) {
              stopped = true;
              setIsProcessing(true);
              scanner.stop().catch(() => {});
              onScanRef.current(decodedText);
            }
          },
          () => {},
        );

        if (stopped) return;

        const capabilities =
          scanner.getRunningTrackCapabilities() as BarcodeMediaTrackCapabilities;
        const advancedConstraints: BarcodeMediaTrackConstraintSet[] = [];

        if (supportsFocusMode(capabilities, "continuous")) {
          advancedConstraints.push({ focusMode: "continuous" });
        }

        const zoom = getModerateZoom(capabilities);
        if (zoom !== null) {
          advancedConstraints.push({ zoom });
        }

        if (advancedConstraints.length > 0) {
          await scanner
            .applyVideoConstraints({ advanced: advancedConstraints })
            .catch(() => {});
        }

        setCanUseTorch(capabilities.torch === true);
        setReady(true);
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
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [restartKey]);

  async function handleToggleTorch() {
    const scanner = scannerRef.current;
    if (!scanner || !canUseTorch) return;

    const nextTorchState = !isTorchOn;

    try {
      await scanner.applyVideoConstraints({
        advanced: [{ torch: nextTorchState } as BarcodeMediaTrackConstraintSet],
      });
      setIsTorchOn(nextTorchState);
    } catch {
      setCanUseTorch(false);
      setIsTorchOn(false);
    }
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const scannedCode = manualBarcode.trim();

    if (!scannedCode || isProcessing) return;

    setIsProcessing(true);
    scannerRef.current?.stop().catch(() => {});
    onScanRef.current(scannedCode);
  }

  function handleRetry() {
    setRestartKey((current) => current + 1);
  }

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
        {ready && canUseTorch && (
          <button
            type="button"
            onClick={handleToggleTorch}
            className="ml-auto flex h-11 items-center rounded-xl bg-white/15 px-4 text-sm font-medium text-white active:bg-white/25"
          >
            {isTorchOn ? "Senter On" : "Senter"}
          </button>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div id="barcode-scanner-container" className="h-full w-full" />

        {!ready && !error && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/70">Memuat kamera…</p>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-sm font-medium text-white">Memproses barcode…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-white/80">{error}</p>
            <div className="flex w-full max-w-xs gap-3">
              <button
                onClick={handleRetry}
                className="min-h-11 flex-1 rounded-xl bg-white px-4 py-3 text-base font-medium text-black active:bg-white/80"
              >
                Coba Lagi
              </button>
              <button
                onClick={onClose}
                className="min-h-11 flex-1 rounded-xl bg-white/20 px-4 py-3 text-base font-medium text-white active:bg-white/30"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>

      {!error && (
        <div className="space-y-4 px-4 py-6 text-center">
          {ready && (
            <p className="text-sm text-white/70">
              Posisikan barcode mendatar, isi kotak scan, dan hindari pantulan cahaya.
            </p>
          )}
          <form onSubmit={handleManualSubmit} className="mx-auto flex max-w-md gap-2">
            <input
              value={manualBarcode}
              onChange={(event) => setManualBarcode(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Masukkan barcode manual"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 text-base text-white placeholder:text-white/45 outline-none focus:border-white/40"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim() || isProcessing}
              className="min-h-11 rounded-xl bg-white px-5 text-base font-medium text-black disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/50 active:bg-white/80"
            >
              Pakai
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
