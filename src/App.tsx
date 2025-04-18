import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { CustomerLayout } from "@/components/CustomerLayout";
import { EmployeeLayout } from "@/components/EmployeeLayout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import Employees from "@/pages/Employees";
import Customers from "@/pages/Customers";
import Maintenance from "@/pages/Maintenance";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

// Import subpages
import FuelInventory from "@/pages/inventory/FuelInventory";
import Products from "@/pages/inventory/Products";
import Transactions from "@/pages/sales/Transactions";
import SalesReports from "@/pages/sales/Reports";
import Expenses from "@/pages/finance/Expenses";
import Revenue from "@/pages/finance/Revenue";

// Auth pages
import Login from "@/pages/auth/Login";
import AdminLogin from "@/pages/auth/AdminLogin";
import CustomerLogin from "@/pages/auth/CustomerLogin";
import EmployeeLogin from "@/pages/auth/EmployeeLogin";

// Customer pages
import CustomerDashboard from "@/pages/customer/Dashboard";
import FuelPurchases from "@/pages/customer/FuelPurchases";
import PaymentMethods from "@/pages/customer/PaymentMethods";
import CustomerProfile from "@/pages/customer/Profile";
import CustomerInvoices from "@/pages/customer/Invoices";

// Employee pages
import EmployeeDashboard from "@/pages/employee/Dashboard";
import EmployeeAttendance from "@/pages/employee/Attendance";
import EmployeeProfile from "@/pages/employee/Profile";
import EmployeeSchedule from "@/pages/employee/Schedule";
import EmployeePayroll from "@/pages/employee/Payroll";

const queryClient = new QueryClient();

// Create a protected route component to check auth
const ProtectedRoute = ({ children, userType }: { children: JSX.Element, userType: string }) => {
  const storedUserType = localStorage.getItem("userType");
  const token = localStorage.getItem("token");

  console.log(`[DEBUG][ProtectedRoute] Checking access for route requiring userType: ${userType}`);
  console.log(`[DEBUG][ProtectedRoute] Stored userType: ${storedUserType}`);
  console.log(`[DEBUG][ProtectedRoute] Token exists: ${!!token}`);

  if (!token) {
    // If no token is stored, redirect to login
    console.log(`[DEBUG][ProtectedRoute] No token found, redirecting to login`);
    return <Navigate to="/auth/login" replace />;
  } 
  
  if (!storedUserType) {
    // If no user type is stored but token exists, assume it's the requested type for now
    // This helps during debugging when localStorage might not be properly set
    console.log(`[DEBUG][ProtectedRoute] No userType found but token exists, allowing access`);
    return children;
  }
  
  if (storedUserType !== userType) {
    // If wrong user type, redirect to appropriate dashboard
    console.log(`[DEBUG][ProtectedRoute] UserType mismatch: stored=${storedUserType}, required=${userType}`);
    
    if (storedUserType === "admin") {
      return <Navigate to="/admin/dashboard" replace />; // Updated admin dashboard route
    } else if (storedUserType === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (storedUserType === "employee") {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  // If correct user type, render the children
  console.log(`[DEBUG][ProtectedRoute] Access granted for ${userType} route`);
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Initial route redirects to login */}
          <Route path="/index" element={<Index />} />
          <Route index element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/admin" element={<AdminLogin />} />
          <Route path="/auth/customer" element={<CustomerLogin />} />
          <Route path="/auth/employee" element={<EmployeeLogin />} />
          
          {/* Admin Routes - Protected */}
          <Route element={
            <ProtectedRoute userType="admin">
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            
            {/* Inventory routes */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/fuel" element={<FuelInventory />} />
            <Route path="/inventory/products" element={<Products />} />
            
            {/* Sales routes */}
            <Route path="/sales" element={<Sales />} />
            <Route path="/sales/transactions" element={<Transactions />} />
            <Route path="/sales/reports" element={<SalesReports />} />
            
            {/* Other main routes */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/maintenance" element={<Maintenance />} />
            
            {/* Finance routes */}
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/expenses" element={<Expenses />} />
            <Route path="/finance/revenue" element={<Revenue />} />
            
            {/* Reports and Settings */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Customer Routes - Protected */}
          <Route element={
            <ProtectedRoute userType="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/fuel-purchases" element={<FuelPurchases />} />
            <Route path="/customer/invoices" element={<CustomerInvoices />} />
            <Route path="/customer/payment-methods" element={<PaymentMethods />} />
          </Route>
          
          {/* Employee Routes - Protected */}
          <Route element={
            <ProtectedRoute userType="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/profile" element={<EmployeeProfile />} />
            <Route path="/employee/schedule" element={<EmployeeSchedule />} />
            <Route path="/employee/attendance" element={<EmployeeAttendance />} />
            <Route path="/employee/payroll" element={<EmployeePayroll />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
