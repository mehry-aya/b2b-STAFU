export type OrderStatus = "draft" | "pending_payment" | "paid" | "shipped" | "cancelled";

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
    product: {
      title: string;
    };
  };
}

export interface Order {
  id: number;
  dealerId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  dealer?: {
    companyName: string;
    address: string | null;
    phone: string | null;
  };
}
