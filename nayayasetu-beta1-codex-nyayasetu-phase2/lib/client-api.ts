export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The request could not be completed.");
  return body as T;
}

export function formatDate(value?: string | null, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (!value) return "Date to be set";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Date to be set";
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}
