import type { UserSession } from "@/lib/types";

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The request could not be completed.");
  return body as T;
}

export function formatDate(
  value?: string | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
) {
  if (!value) return "Date to be set";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Date to be set";
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export async function fetchCurrentUser(): Promise<UserSession | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.authenticated ? (data.user as UserSession) : null;
  } catch {
    return null;
  }
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "File upload failed.");
  return data.file as {
    id: string;
    filename: string;
    url: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
}
