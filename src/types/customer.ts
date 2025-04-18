export interface Customer {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: "new" | "regular" | "premium";
  loyaltyPoints?: number;
  vehicle?: string;
  address?: string;
  lastVisit?: string;
  memberSince?: string;
  notes?: string;
  customerType?: "individual" | "business";
  membershipLevel?: "basic" | "silver" | "gold" | "platinum";
  createdAt?: string;
  updatedAt?: string;
} 