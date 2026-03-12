export interface ProductVariant {
  id: number;
  shopifyVariantId: string;
  productId: number;
  title: string;
  sku: string | null;
  price: string | null;
  compareAtPrice: string | null;
  inventoryQuantity: number | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  imageUrl: string | null;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: number;
  shopifyId: string;
  title: string;
  description: string | null;
  handle: string | null;
  vendor: string | null;
  productType: string | null;
  status: string;
  images: ProductImage[] | null;
  options?: { name: string; values: string[] }[];
  syncedAt: string;
  variants?: ProductVariant[];
  relatedProducts?: {
    id: number;
    title: string;
    handle: string;
    images: ProductImage[] | null;
  }[];
}
