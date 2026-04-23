const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const BASE_URL = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

interface ApiError {
  title?: string;
  detail?: string;
  status?: number;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({}));
    throw new ApiException(
      response.status,
      error.detail ?? error.title ?? `Request failed: ${response.status}`,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
