export interface Employee {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  position: string;
  department: string;
  employeeId?: string;
  hireDate?: Date | string;
  salary: number;
  status: "active" | "on_leave" | "terminated" | "suspended";
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
  documents?: string[];
  profileImage?: string;
  notes?: string;
  permissions?: string[];
  lastLogin?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
} 