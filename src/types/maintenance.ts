export interface MaintenanceTask {
  _id?: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "deferred";
  priority: "low" | "medium" | "high" | "critical";
  category: "equipment" | "facility" | "vehicle" | "it_systems" | "safety" | "cleaning" | "calibration" | "inspection" | "other";
  assignedTo?: any; // Employee reference
  createdBy?: string;
  dueDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  location?: string;
  equipment?: string;
  vendorInfo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
} 