export const API_BASE = "http://localhost:3001";

export async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}
