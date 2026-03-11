"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPayload } from "@/lib/auth";
import { decodeJwt } from "jose";

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await fetch("http://127.0.0.1:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Invalid credentials" };
    }

    const { access_token } = await response.json();

    const cookieStore = await cookies();
    cookieStore.set("token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    const payload = decodeJwt(access_token) as AuthPayload;
    
    if (payload.role === "master_admin") {
      redirect("/master/dashboard");
    } else if (payload.role === "admin") {
      redirect("/admin/dashboard");
    } else if (payload.role === "dealer") {
      redirect("/dealer/dashboard");
    } else {
      return { error: "Unknown user role" };
    }
  } catch (error: unknown) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    return { error: "Failed to connect to authentication server" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  try {
    const response = await fetch("http://127.0.0.1:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, companyName, phone, address }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Registration failed" };
    }

    return { success: "Account created successfully. You can now login." };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function createAdminAction(email: string, password: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/users/create-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to create admin" };
    }

    return { success: true };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function deleteAdminAction(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch(`http://127.0.0.1:3001/api/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to delete admin" };
    }

    return { success: true };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function getProductsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/products", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to fetch products" };
    }

    return { products: await response.json() };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function syncProductsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/products/sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to sync products" };
    }

    return { success: true, data: await response.json() };
  } catch {
    return { error: "Failed to connect to server" };
  }
}
export async function getDealerStatusAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { error: "Failed to fetch profile" };
    }

    const user = await response.json();
    return { dealer: user.dealer };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function uploadContractAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/dealers/contract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Upload failed" };
    }

    return { success: true, dealer: await response.json() };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function getDealersAdminAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/dealers/admin/list", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return { error: "Failed to fetch dealers" };

    return { dealers: await response.json() };
  } catch {
    return { error: "Connection error" };
  }
}

export async function approveDealerAction(id: number, status: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch(`http://127.0.0.1:3001/api/dealers/admin/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return { error: "Update failed" };

    return { success: true };
  } catch {
    return { error: "Connection error" };
  }
}

export async function createOrderAction(items: { productId: number; variantId: number; quantity: number }[], notes?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items, notes }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to create order" };
    }

    return { success: true, order: await response.json() };
  } catch {
    return { error: "Failed to connect to server" };
  }
}

export async function getOrdersAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return { error: "Failed to fetch orders" };
    return { orders: await response.json() };
  } catch {
    return { error: "Connection error" };
  }
}

export async function getMyOrdersAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/orders/my-orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return { error: "Failed to fetch your orders" };
    return { orders: await response.json() };
  } catch {
    return { error: "Connection error" };
  }
}

export async function updateOrderStatusAction(id: number, status: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch(`http://127.0.0.1:3001/api/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) return { error: "Update failed" };
    return { success: true };
  } catch {
    return { error: "Connection error" };
  }
}

export async function getMeAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return { error: "Failed to fetch profile" };
    return await response.json();
  } catch {
    return { error: "Connection error" };
  }
}

export async function updateProfileAction(payload: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Authentication required" };

  try {
    const response = await fetch("http://127.0.0.1:3001/api/users/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.message || "Failed to update profile" };
    }

    return { success: true };
  } catch {
    return { error: "Connection error" };
  }
}
