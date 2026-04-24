const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const BASE_URL = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let csrfToken: string | null = null;
let csrfHeaderName = "X-CSRF-TOKEN";

interface ApiError {
  title?: string;
  detail?: string;
  status?: number;
}

interface CsrfResponse {
  headerName: string;
  token: string;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfHeaderName = "X-CSRF-TOKEN";
}

async function ensureCsrfToken() {
  if (csrfToken) return;

  const response = await fetch(`${BASE_URL}/auth/csrf`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiException(response.status, `Request failed: ${response.status}`);
  }

  const data = (await response.json()) as CsrfResponse;
  csrfHeaderName = data.headerName;
  csrfToken = data.token;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = options?.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  if (CSRF_METHODS.has(method) && !headers.has(csrfHeaderName)) {
    await ensureCsrfToken();
    if (csrfToken) headers.set(csrfHeaderName, csrfToken);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) clearCsrfToken();
    const error: ApiError = await response.json().catch(() => ({}));
    throw new ApiException(
      response.status,
      error.detail ?? error.title ?? `Request failed: ${response.status}`,
    );
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
