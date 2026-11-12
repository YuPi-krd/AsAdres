import { cookies } from "next/headers";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export async function serverApiFetch(pathOrUrl: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("doma_admin_session")?.value;
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${API_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
  return fetch(url, { ...init, headers, cache: init.cache ?? "no-store" });
}
