import { getToken } from "./auth";

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD ? "" : "http://localhost:3001");

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(API_BASE + path, {
    ...options,
    headers
  });
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  return res.json();
}
