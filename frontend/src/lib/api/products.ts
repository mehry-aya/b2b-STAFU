'use server';

import { cookies } from 'next/headers';
import { Product } from '../types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProducts(
  search?: string,
  productType?: string,
  all?: boolean,
  category?: string,
  inStock?: boolean
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (productType) params.append('productType', productType);
  if (all) params.append('all', 'true');
  if (category) params.append('category', category);
  if (inStock) params.append("inStock", "true");
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = `${API_BASE_URL}/products${queryString}`;
  
  console.log(`[Server Action] fetchProducts calling: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Server Action] fetchProducts failed: ${response.status} ${response.statusText}`, text.substring(0, 200));
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`[Server Action] fetchProducts exception:`, (error as Error).message);
    throw error;
  }
}

export async function fetchCategories(): Promise<any[]> {
  const url = `${API_BASE_URL}/products/categories`;
  console.log(`[Server Action] fetchCategories calling: ${url}`);

  try {
    const response = await fetch(url, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Server Action] fetchCategories failed: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  } catch (error) {
    console.error(`[Server Action] fetchCategories exception:`, error);
    throw error;
  }
}

export async function fetchProductById(id: number | string): Promise<Product> {
  const url = `${API_BASE_URL}/products/${id}`;
  console.log(`[Server Action] fetchProductById calling: ${url}`);

  try {
    const response = await fetch(url, {
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Server Action] fetchProductById failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch product ${id}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[Server Action] fetchProductById exception:`, error);
    throw error;
  }
}

export async function syncShopifyProducts(): Promise<{ productsSynced: number; variantsSynced: number; errors: string[] }> {
  const url = `${API_BASE_URL}/products/sync`;
  console.log(`[Server Action] syncShopifyProducts calling: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: await getAuthHeader(),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`[Server Action] syncShopifyProducts failed:`, errorData);
      throw new Error(errorData?.message || 'Failed to sync Shopify products');
    }

    return response.json();
  } catch (error) {
    console.error(`[Server Action] syncShopifyProducts exception:`, error);
    throw error;
  }
}
