import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Usage:
//   apiFetch("/api/me")                                  -> logged-in request
//   apiFetch("/api/services", { auth: false })           -> public request
//   apiFetch("/api/services", { method: "POST", body: {...} })
export async function apiFetch(path, { auth = true, body, headers, ...options } = {}) {
  const finalHeaders = { ...headers };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    // JWTs are short-lived, so we ask for a fresh one each time
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      throw new Error("You must be logged in to do this");
    }
    finalHeaders.Authorization = `Bearer ${data.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(result?.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return result;
}