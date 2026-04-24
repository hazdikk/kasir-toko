"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiException } from "@/services/api";
import { useAuth } from "@/components/AuthProvider";

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) return "/kasir";
  return nextPath;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextPath = getSafeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, nextPath, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(username.trim(), password);
      router.replace(nextPath);
    } catch (err) {
      if (err instanceof ApiException && err.status === 401) {
        setError("Username atau password salah.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal masuk.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Kasir Toko</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Masuk sebagai owner</h1>
          <p className="mt-2 text-base text-gray-600">Akses kasir, produk, supplier, dan laporan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-base text-gray-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-base text-gray-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="min-h-11 w-full rounded-lg bg-blue-600 px-4 text-base font-semibold text-white active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center px-4 text-base text-gray-500">
          Memuat...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
