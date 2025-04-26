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
  const [loyaltyPoints, setLoyaltyPoints] = useState(localStorage.getItem("loyaltyPoints") || "0");
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
        // First, try to get the dashboard summary which contains all the data we need
        const dashboardResponse = await api.customer.getDashboardSummary();
        
        if (dashboardResponse.success && dashboardResponse.data) {
          console.log("Dashboard data:", dashboardResponse.data);
          
          // Set loyalty points from dashboard data
          if (dashboardResponse.data.customerInfo && dashboardResponse.data.customerInfo.loyaltyPoints) {
            setLoyaltyPoints(dashboardResponse.data.customerInfo.loyaltyPoints.toString());
            localStorage.setItem("loyaltyPoints", dashboardResponse.data.customerInfo.loyaltyPoints.toString());
          }
          
          // Process recent transactions
          if (dashboardResponse.data.recentActivity && dashboardResponse.data.recentActivity.purchases) {
            setRecentTransactions(dashboardResponse.data.recentActivity.purchases);
          }
          
          // Set totals from statistics
          if (dashboardResponse.data.statistics) {
            const stats = dashboardResponse.data.statistics;
            setTotals({
              totalSpent: stats.allTime?.totalSpent || 0,
              totalGallons: stats.allTime?.totalGallons || 0,
              totalTransactions: stats.allTime?.totalVisits || 0
            });
          }
          
          // Set chart data directly from the dashboard data if available
          if (dashboardResponse.data.monthlyData) {
            setFuelPurchaseData(dashboardResponse.data.monthlyData);
            
            // Create spending trend data from monthly data
            const trendData = dashboardResponse.data.monthlyData.map((item: any) => ({
              month: item.month,
              amount: item.totalAmount
            }));
            setSpendingTrendData(trendData);
          }
          
          // Set payment method data
          if (dashboardResponse.data.paymentMethods) {
            setPaymentMethodData(dashboardResponse.data.paymentMethods);
          }
        } else {
          // If dashboard data fails, fall back to fuel purchases endpoint
          await fetchFuelPurchaseData();
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        
        // Try the fuel purchases endpoint as fallback
        await fetchFuelPurchaseData();
      } finally {
        setLoading(false);
      }
    };
    
    const fetchFuelPurchaseData = async () => {
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
        } else {
          // Fallback to mock data
          setMockData();
        }
      } catch (error) {
        console.error("Error fetching fuel purchase data:", error);
        // Fallback to mock data
        setMockData();
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
