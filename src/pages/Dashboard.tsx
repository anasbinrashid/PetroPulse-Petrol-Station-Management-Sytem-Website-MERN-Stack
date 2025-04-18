import { useState, useEffect } from "react";
import { Droplets, DollarSign, ShoppingCart, Users, Clock, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FuelLevelChart } from "@/components/dashboard/FuelLevelChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TopSellingProducts } from "@/components/dashboard/TopSellingProducts";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

export default function Dashboard() {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [fuelInventory, setFuelInventory] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch main dashboard statistics
        const dashboardResponse = await api.admin.getDashboard();
        if (dashboardResponse.success && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        } else {
          console.error("Failed to fetch dashboard data:", dashboardResponse.error);
        }

        // Fetch fuel inventory
        const inventoryResponse = await api.fuelInventory.getAll();
        if (inventoryResponse.success && inventoryResponse.data) {
          // Transform fuel inventory data to match component requirements
          const fuelData = inventoryResponse.data.map((item: any, index: number) => ({
            type: item.fuelType || item.name,
            level: item.currentLevel || item.amount || 0,
            capacity: item.capacity || item.maxCapacity || 20000,
            color: ["blue", "green", "yellow", "purple"][index % 4] // Cycle through colors
          }));
          setFuelInventory(fuelData);
        }

        // Fetch recent sales/transactions
        const salesResponse = await api.sales.getAll();
        if (salesResponse.success && salesResponse.data) {
          // Get the 5 most recent transactions
          const transactions = salesResponse.data
            .slice(0, 5)
            .map((sale: any) => ({
              id: sale._id || sale.id,
              date: new Date(sale.createdAt || sale.date).toLocaleString(),
              type: sale.itemType || sale.productName || 'Purchase',
              amount: sale.totalAmount || sale.price || 0,
              pumpNumber: sale.pumpNumber || sale.pump || '-',
              paymentMethod: sale.paymentMethod || 'Card',
            }));
          setRecentTransactions(transactions);
        }

        // Fetch top selling products
        const productsResponse = await api.products.getAll();
        if (productsResponse.success && productsResponse.data) {
          // Sort products by sales or another metric and take top 4
          const sortedProducts = [...productsResponse.data]
            .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
            .slice(0, 4)
            .map((product: any) => ({
              id: product._id || product.id,
              name: product.name || product.title,
              category: product.category || "General",
              sales: product.salesCount || product.soldQuantity || 0,
              revenue: product.price * (product.salesCount || product.soldQuantity || 0),
            }));
          setTopProducts(sortedProducts);
        }

        // Fetch revenue data for chart
        const now = new Date();
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        const revenueResponse = await api.revenue.getAll({
          startDate: sevenDaysAgo.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });

        if (revenueResponse.success && revenueResponse.data) {
          // Process revenue data for chart
          const chartData = revenueResponse.data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: item.amount || item.total || 0
          }));
          
          setRevenueData(chartData);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={dashboardData?.revenue?.total ? `$${dashboardData.revenue.total.toLocaleString()}` : "$0"}
          description="Last 7 days"
          icon={DollarSign}
          trend={dashboardData?.revenue?.trend > 0 ? "up" : dashboardData?.revenue?.trend < 0 ? "down" : "neutral"}
          trendValue={dashboardData?.revenue?.trend ? `${dashboardData.revenue.trend > 0 ? "+" : ""}${dashboardData.revenue.trend}% from last week` : "No change"}
        />
        <StatCard
          title="Fuel Sales"
          value={dashboardData?.fuelSales?.volume ? `${dashboardData.fuelSales.volume.toLocaleString()} gallons` : "0 gallons"}
          description="Last 7 days"
          icon={Droplets}
          trend={dashboardData?.fuelSales?.trend > 0 ? "up" : dashboardData?.fuelSales?.trend < 0 ? "down" : "neutral"}
          trendValue={dashboardData?.fuelSales?.trend ? `${dashboardData.fuelSales.trend > 0 ? "+" : ""}${dashboardData.fuelSales.trend}% from last week` : "No change"}
        />
        <StatCard
          title="Transactions"
          value={dashboardData?.transactions?.count?.toString() || "0"}
          description="Last 7 days"
          icon={ShoppingCart}
          trend={dashboardData?.transactions?.trend > 0 ? "up" : dashboardData?.transactions?.trend < 0 ? "down" : "neutral"}
          trendValue={dashboardData?.transactions?.trend ? `${dashboardData.transactions.trend > 0 ? "+" : ""}${dashboardData.transactions.trend}% from last week` : "No change"}
        />
        <StatCard
          title="Customers"
          value={dashboardData?.customers?.count?.toString() || "0"}
          description="Repeat customers this week"
          icon={Users}
          trend={dashboardData?.customers?.trend > 0 ? "up" : dashboardData?.customers?.trend < 0 ? "down" : "neutral"}
          trendValue={dashboardData?.customers?.trend ? `${dashboardData.customers.trend > 0 ? "+" : ""}${dashboardData.customers.trend}% from last week` : "No change"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-3">
          <RevenueChart data={revenueData.length > 0 ? revenueData : []} />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <StatCard
            title="Average Transaction"
            value={dashboardData?.transactions?.average ? `$${dashboardData.transactions.average.toFixed(2)}` : "$0.00"}
            description="Per visit"
            icon={BarChart3}
            trend={dashboardData?.transactions?.avgTrend > 0 ? "up" : dashboardData?.transactions?.avgTrend < 0 ? "down" : "neutral"}
            trendValue={dashboardData?.transactions?.avgTrend ? `${dashboardData.transactions.avgTrend > 0 ? "+" : ""}${dashboardData.transactions.avgTrend}% from last week` : "No change"}
            className="h-full"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="col-span-2 md:col-span-1 lg:col-span-4">
          <FuelLevelChart data={fuelInventory.length > 0 ? fuelInventory : []} />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-4">
          <TopSellingProducts products={topProducts.length > 0 ? topProducts : []} />
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-4">
          <RecentTransactions transactions={recentTransactions.length > 0 ? recentTransactions : []} />
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for dashboard
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-48" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="col-span-2 lg:col-span-3 h-[350px]" />
        <Skeleton className="md:col-span-2 lg:col-span-1 h-[350px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <Skeleton className="col-span-2 md:col-span-1 lg:col-span-4 h-[400px]" />
        <Skeleton className="col-span-2 md:col-span-1 lg:col-span-4 h-[400px]" />
        <Skeleton className="col-span-2 md:col-span-2 lg:col-span-4 h-[400px]" />
      </div>
    </div>
  );
}
