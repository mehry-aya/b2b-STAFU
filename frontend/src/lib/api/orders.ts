'use server';

import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { OrderStatus } from "../types/order";
import { mapBackendError } from '@/lib/utils';

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
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Server Action] fetchOrders failed: ${response.status} ${response.statusText}`, errorText);
      return { error: 'Failed to fetch orders' };
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('[Server Action] fetchOrders exception:', error.message);
    return { error: error.message || 'connectionError' };
  }
}

export async function fetchOrderById(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Server Action] fetchOrderById failed: ${response.status} ${response.statusText}`, errorText);
      return { error: `Failed to fetch order ${id}` };
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('[Server Action] fetchOrderById exception:', error.message);
    return { error: error.message || 'connectionError' };
  }
}

export async function createOrder(items: { variantId: number; quantity: number }[]) {
  try {
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
      console.error(`[Server Action] createOrder failed:`, errorData);
      return { error: mapBackendError(errorData.message || "Failed to create order") };
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('[Server Action] createOrder exception:', error.message);
    return { error: error.message || 'connectionError' };
  }
}

export async function updateOrderStatus(id: number, status: OrderStatus, paymentAmount?: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
      },
      body: JSON.stringify({ status, paymentAmount }),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Server Action] updateOrderStatus failed: ${response.status}`, errorText);
      return { error: "Failed to update order status" };
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('[Server Action] updateOrderStatus exception:', error.message);
    return { error: error.message || 'connectionError' };
  }
}

export async function exportOrdersToExcel() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/export/excel`, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`[Server Action] exportOrdersToExcel failed: ${response.status}`);
      return { error: "Failed to export orders" };
    }
    
    // Return the blob for the client to handle
    const blob = await response.blob();
    return blob;
  } catch (error: any) {
    console.error('[Server Action] exportOrdersToExcel exception:', error.message);
    return { error: error.message || 'connectionError' };
  }
}

export async function deleteOrder(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "DELETE",
      headers: await getAuthHeader(),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Server Action] deleteOrder failed: ${response.status}`, errorText);
      return { error: "Failed to delete order" };
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('[Server Action] deleteOrder exception:', error.message);
    return { error: error.message || 'connectionError' };
  }
}
