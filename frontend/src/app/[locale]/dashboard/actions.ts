"use server";

import { cookies } from "next/headers";

const API_URL = "http://127.0.0.1:3001/api";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function getAdminStatsAction() {
  const token = await getAuthToken();
  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch(`${API_URL}/stats/admin`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to fetch admin stats" };
    }

    return { stats: await response.json() };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function getDealerStatsAction() {
  const token = await getAuthToken();
  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch(`${API_URL}/stats/dealer`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to fetch dealer stats" };
    }

    return { stats: await response.json() };
  } catch {
    return { error: "Failed to connect to server" };
  }
}
