export class AdminClientError extends Error {
  constructor(public code: string) { super(code); }
}
export async function adminRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: "same-origin", cache: "no-store" });
  let data: unknown;
  try { data = await response.json(); } catch { throw new AdminClientError("SERVICE_UNAVAILABLE"); }
  if (!response.ok) {
    const code = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : "UNKNOWN";
    throw new AdminClientError(code);
  }
  return data as T;
}
