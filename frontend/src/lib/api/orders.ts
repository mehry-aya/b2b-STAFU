'use server';

import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { OrderStatus } from "../types/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const locale = await getLocale();

  const headers: Record<string, string> = {
    'x-lang': locale || 'tr',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function fetchOrders(page: number = 1, limit: number = 10) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
    headers: await getAuthHeader(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

export async function fetchOrderById(id: number) {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: await getAuthHeader(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error("Failed to fetch order details");
  return response.json();
}

export async function createOrder(items: { variantId: number; quantity: number }[]) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ items }),
    cache: 'no-store',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create order");
  }
  return response.json();
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ status }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error("Failed to update order status");
  return response.json();
}

export async function exportOrdersToExcel() {
  const response = await fetch(`${API_BASE_URL}/orders/export/excel`, {
    headers: await getAuthHeader(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error("Failed to export orders");
  
  // Return the blob for the client to handle
  const blob = await response.blob();
  return blob;
}
