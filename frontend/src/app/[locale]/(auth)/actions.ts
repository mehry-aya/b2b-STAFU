"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPayload } from "@/lib/auth";
import { decodeJwt } from "jose";

const API_BASE = process.env.BACKEND_URL || 'http://127.0.0.1:3001/api';

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "emailPasswordRequired" };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      // If the backend returns a specific message, we use that, otherwise generic invalid credentials
      return { error: data.message ? (data.message === "Invalid credentials" ? "invalidCredentials" : data.message) : "invalidCredentials" };
    }

    const { access_token } = await response.json();

    const cookieStore = await cookies();
    cookieStore.set("token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    const payload = decodeJwt(access_token) as AuthPayload;
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "tr";

    if (payload.role === "master_admin") {
      redirect(`/${locale}/master/dashboard`);
    } else if (payload.role === "admin") {
      redirect(`/${locale}/admin/dashboard`);
    } else if (payload.role === "dealer") {
      redirect(`/${locale}/dealer/dashboard`);
    } else {
      return { error: "unknownUserRole" };
    }
  } catch (error: unknown) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    return { error: "connectionError" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, companyName, phone, address }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "registrationFailed" };
    }

    return { success: "accountCreated" };
  } catch {
    return { error: "connectionError" };
  }
}

export async function createAdminAction(email: string, password: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/users/create-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "createAdminFailed" };
    }

    return { success: "adminCreated" };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getAdminsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/users/admins`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "fetchAdminsFailed" };
    }

    return { admins: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function deleteAdminAction(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "deleteAdminFailed" };
    }

    return { success: "adminDeleted" };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getProductsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "fetchProductsFailed" };
    }

    return { products: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function syncProductsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/products/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "syncProductsFailed" };
    }

    return { success: "productsSynced", data: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getDealerStatusAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchProfileFailed" };

    const user = await response.json();
    return { dealer: user.dealer };
  } catch {
    return { error: "connectionError" };
  }
}

export async function uploadContractAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/contracts/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // FormData contains 'file' and 'dealerId'
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "uploadFailed" };
    }

    return { success: "uploadSuccess", contract: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getMyContractsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/contracts/my-contracts`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchContractsFailed" };
    return { data: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getAdminContractsAction(status?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const url = status 
      ? `${API_BASE}/contracts/admin/list?status=${status}`
      : `${API_BASE}/contracts/admin/list`;

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchContractsFailed" };
    return { data: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function reviewContractAction(id: number, status: string, notes?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/contracts/${id}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) return { error: "reviewUpdateFailed" };
    return { success: "reviewSuccess", contract: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getDealersAdminAction(page: number = 1, limit: number = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE}/dealers/admin/list?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchDealersFailed" };
    return { data: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getDealerDetailAction(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/dealers/admin/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchDealerDetailsFailed" };
    return { dealer: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function approveDealerAction(id: number, status: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/dealers/admin/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return { error: "updateFailed" };
    return { success: "updateSuccess" };
  } catch {
    return { error: "connectionError" };
  }
}

export async function createOrderAction(items: { productId: number; variantId: number; quantity: number }[], notes?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items, notes }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "createOrderFailed" };
    }

    return { success: "orderCreated", order: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getOrdersAction(page: number = 1, limit: number = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE}/orders?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchOrdersFailed" };
    return { data: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getMyOrdersAction(page: number = 1, limit: number = 10) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE}/orders/my-orders?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { error: "fetchOrdersFailed" };
    return { data: await response.json() };
  } catch {
    return { error: "connectionError" };
  }
}

export async function updateOrderStatusAction(id: number, status: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return { error: "updateFailed" };
    return { success: "updateSuccess" };
  } catch {
    return { error: "connectionError" };
  }
}

export async function getMeAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return { error: "fetchProfileFailed" };
    return await response.json();
  } catch {
    return { error: "connectionError" };
  }
}

export async function updateProfileAction(payload: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "authRequired" };

  try {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "updateProfileFailed" };
    }

    return { success: "updateSuccess" };
  } catch {
    return { error: "connectionError" };
  }
}
