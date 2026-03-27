export type OrderStatus = "draft" | "pending_half_payment" | "half_payment_received" | "shipped" | "received" | "pending_rest_payment" | "paid" | "cancelled";

export interface OrderItem {
  id: number;
  orderId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  productVariant: {
    title: string;
    sku: string | null;
    imageUrl: string | null;
    compareAtPrice: string | number | null;
    product: {
      title: string;
      images: any; // Using any for Json field from Prisma
    };
  };
}

export interface Order {
  id: number;
  dealerId: number;
  totalAmount: number;
  status: OrderStatus;
  statusChangedByEmail?: string | null;
  statusChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  notes?: string | null;
  dealer?: {
    companyName: string;
    address: string | null;
    phone: string | null;
  };
}
