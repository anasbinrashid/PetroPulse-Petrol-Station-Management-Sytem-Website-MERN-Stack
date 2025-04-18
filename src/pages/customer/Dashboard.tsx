
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { CustomerFuelPurchaseResponse } from "@/types/api";
import { CustomerStatCards } from "@/components/customer/CustomerStatCards";
import { FuelPurchaseBarChart } from "@/components/customer/FuelPurchaseBarChart";
import { SpendingTrendChart } from "@/components/customer/SpendingTrendChart";
import { PaymentMethodsPieChart } from "@/components/customer/PaymentMethodsPieChart";
import { RecentTransactionsList } from "@/components/customer/RecentTransactionsList";
import { DashboardLoading } from "@/components/customer/DashboardLoading";
import { generateMockCustomerData } from "@/utils/customerDashboardMockData";

export default function CustomerDashboard() {
  const [customerName] = useState(localStorage.getItem("userName") || "Customer");
  const [customerId] = useState(localStorage.getItem("customerId") || "");
  const [loyaltyPoints] = useState(localStorage.getItem("loyaltyPoints") || "0");
  const [fuelPurchaseData, setFuelPurchaseData] = useState([]);
  const [spendingTrendData, setSpendingTrendData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalSpent: 0,
    totalGallons: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      
      try {
        // Fetch fuel purchases for the customer
        const response = await api.sales.getFuelPurchasesByCustomer(customerId);
        
        if (response.success && response.data) {
          const data = response.data as CustomerFuelPurchaseResponse;
          
          // Set recent transactions
          setRecentTransactions(data.fuelSales || []);
          
          // Set monthly fuel purchase data
          setFuelPurchaseData(data.monthlyData || []);
          
          // Set spending trend data
          const trendData = data.monthlyData?.map((item: any) => ({
            month: item.month,
            amount: item.regular + item.premium + item.diesel
          })) || [];
          setSpendingTrendData(trendData);
          
          // Set payment method data
          setPaymentMethodData(data.paymentMethods || []);
          
          // Set totals
          setTotals({
            totalSpent: data.totalSpent || 0,
            totalGallons: data.totalGallons || 0,
            totalTransactions: data.fuelSales?.length || 0
          });
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast.error("Failed to load dashboard data");
        
        // Fallback to mock data if API fails
        setMockData();
      } finally {
        setLoading(false);
      }
    };
    
    if (customerId) {
      fetchCustomerData();
    } else {
      // Use mock data if no customer ID
      setMockData();
      setLoading(false);
    }
  }, [customerId]);
  
  // Fallback to mock data if API fails
  const setMockData = () => {
    const mockData = generateMockCustomerData();
    setFuelPurchaseData(mockData.fuelPurchaseData);
    setSpendingTrendData(mockData.spendingTrendData);
    setPaymentMethodData(mockData.paymentMethodData);
    setRecentTransactions(mockData.recentTransactions);
    setTotals(mockData.totals);
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {customerName}</h1>
          <p className="text-muted-foreground">Here's a summary of your fuel purchases and transactions</p>
        </div>
      </div>

      <CustomerStatCards 
        totalSpent={totals.totalSpent}
        totalGallons={totals.totalGallons}
        totalTransactions={totals.totalTransactions}
        loyaltyPoints={loyaltyPoints}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FuelPurchaseBarChart data={fuelPurchaseData} />
        <SpendingTrendChart data={spendingTrendData} />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <RecentTransactionsList transactions={recentTransactions} />
        <PaymentMethodsPieChart data={paymentMethodData} />
      </div>
    </div>
  );
}
