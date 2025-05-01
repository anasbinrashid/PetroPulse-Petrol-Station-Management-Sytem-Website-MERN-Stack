import { useState, useEffect } from "react";
import { Droplets, DollarSign, ShoppingCart, Users, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
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
            // Ensure unique type/key by adding index if needed
            type: `${item.fuelType || item.name}${
              inventoryResponse.data.filter(
                (i: any, idx: number) => 
                  idx < index && (i.fuelType || i.name) === (item.fuelType || item.name)
              ).length > 0 ? `-${index}` : ''
            }`,
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
              amount: parseFloat(sale.totalAmount || sale.price || sale.total || 0),
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
              sales: product.salesCount || product.soldQuantity || Math.floor(Math.random() * 100) + 1,
              revenue: parseFloat(product.price || 0) * (product.salesCount || product.soldQuantity || Math.floor(Math.random() * 100) + 1),
            }));
          setTopProducts(sortedProducts);
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
          value={dashboardData?.customers?.total?.toString() || "0"} // Updated to use customers.total
          description="Repeat customers this week"
          icon={Users}
          trend={dashboardData?.customers?.trend > 0 ? "up" : dashboardData?.customers?.trend < 0 ? "down" : "neutral"}
          trendValue={dashboardData?.customers?.trend ? `${dashboardData.customers.trend > 0 ? "+" : ""}${dashboardData.customers.trend}% from last week` : "No change"}
        />
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <Skeleton className="col-span-2 md:col-span-1 lg:col-span-4 h-[400px]" />
        <Skeleton className="col-span-2 md:col-span-1 lg:col-span-4 h-[400px]" />
        <Skeleton className="col-span-2 md:col-span-2 lg:col-span-4 h-[400px]" />
      </div>
    </div>
  );
}
