
import { useState } from "react";
import { Download, Calendar, BarChart, PieChart, ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for sales reports
const dailySalesData = [
  { day: "Monday", fuel: 1250, store: 450, total: 1700 },
  { day: "Tuesday", fuel: 1100, store: 380, total: 1480 },
  { day: "Wednesday", fuel: 1350, store: 520, total: 1870 },
  { day: "Thursday", fuel: 1480, store: 490, total: 1970 },
  { day: "Friday", fuel: 1850, store: 650, total: 2500 },
  { day: "Saturday", fuel: 2200, store: 780, total: 2980 },
  { day: "Sunday", fuel: 1900, store: 710, total: 2610 },
];

const productCategoryData = [
  { name: "Fuel", value: 11130, color: "#0284c7" },
  { name: "Snacks", value: 1200, color: "#84cc16" },
  { name: "Beverages", value: 980, color: "#f59e0b" },
  { name: "Tobacco", value: 850, color: "#ef4444" },
  { name: "Automotive", value: 650, color: "#8b5cf6" },
  { name: "Other", value: 300, color: "#64748b" },
];

const topSellingProducts = [
  { rank: 1, name: "Regular Unleaded", category: "Fuel", sales: 8250, change: 12.5 },
  { rank: 2, name: "Diesel", category: "Fuel", sales: 2500, change: 8.3 },
  { rank: 3, name: "Premium Unleaded", category: "Fuel", sales: 1380, change: -5.2 },
  { rank: 4, name: "Energy Drinks", category: "Beverages", sales: 450, change: 15.8 },
  { rank: 5, name: "Cigarettes", category: "Tobacco", sales: 380, change: -2.1 },
  { rank: 6, name: "Coffee", category: "Beverages", sales: 320, change: 22.5 },
  { rank: 7, name: "Snack Chips", category: "Snacks", sales: 280, change: 5.3 },
  { rank: 8, name: "Motor Oil", category: "Automotive", sales: 220, change: 1.2 },
  { rank: 9, name: "Candy", category: "Snacks", sales: 190, change: 9.6 },
  { rank: 10, name: "Lottery Tickets", category: "Other", sales: 180, change: 18.2 },
];

const paymentMethodData = [
  { name: "Credit Card", value: 8950, color: "#0284c7" },
  { name: "Cash", value: 3600, color: "#84cc16" },
  { name: "Debit Card", value: 2500, color: "#f59e0b" },
  { name: "Fleet Card", value: 850, color: "#8b5cf6" },
  { name: "Mobile Pay", value: 210, color: "#ef4444" },
];

export default function SalesReports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  
  // Calculate total sales
  const totalSales = dailySalesData.reduce((sum, day) => sum + day.total, 0);
  const totalFuelSales = dailySalesData.reduce((sum, day) => sum + day.fuel, 0);
  const totalStoreSales = dailySalesData.reduce((sum, day) => sum + day.store, 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <div className="flex items-center gap-2">
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fuel Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFuelSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{((totalFuelSales / totalSales) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Store Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStoreSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{((totalStoreSales / totalSales) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Breakdown</CardTitle>
              <CardDescription>Sales performance by day for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={dailySalesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fuel" name="Fuel Sales" stackId="a" fill="#0284c7" />
                    <Bar dataKey="store" name="Store Sales" stackId="a" fill="#84cc16" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Product category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={productCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellingProducts.slice(0, 6).map((product) => (
                    <div key={product.rank} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${product.sales}</span>
                        <span className={`text-xs flex items-center ${product.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {product.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(product.change)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Sales by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
