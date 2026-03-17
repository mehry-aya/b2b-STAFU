export interface Dealer {
  id: number;
  userId: number;
  companyName: string;
  phone: string | null;
  address: string | null;
  contractUrl: string | null;
  contractStatus: "pending" | "approved" | "rejected" | "suspended";
  statusChangedByEmail?: string | null;
  statusChangedAt?: string | null;
  createdAt: string;
  user: {
    email: string;
    isActive: boolean;
    createdAt?: string;
  };
  orders?: any[];
}
