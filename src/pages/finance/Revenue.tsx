import { useState } from "react";
import { Search, Download, BarChart, TrendingUp, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { RevenueTransaction } from "@/types/api";
import { toast } from "sonner";

const revenueData = [
  { 
    id: "rev1", 
    date: "2023-06-01", 
    source: "Fuel Sales", 
    amount: 8500.00, 
    category: "Gasoline"
  },
  { 
    id: "rev2", 
    date: "2023-06-01", 
    source: "Store Sales", 
    amount: 1200.00, 
    category: "Merchandise"
  },
  { 
    id: "rev3", 
    date: "2023-06-02", 
    source: "Fuel Sales", 
    amount: 7800.00, 
    category: "Diesel"
  },
  { 
    id: "rev4", 
    date: "2023-06-02", 
    source: "Store Sales", 
    amount: 950.00, 
    category: "Merchandise"
  },
  { 
    id: "rev5", 
    date: "2023-06-03", 
    source: "Fuel Sales", 
    amount: 8200.00, 
    category: "Gasoline"
  },
  { 
    id: "rev6", 
    date: "2023-06-03", 
    source: "Car Wash", 
    amount: 450.00, 
    category: "Services"
  },
  { 
    id: "rev7", 
    date: "2023-06-04", 
    source: "Store Sales", 
    amount: 1100.00, 
    category: "Merchandise"
  },
  { 
    id: "rev8", 
    date: "2023-06-04", 
    source: "Fuel Sales", 
    amount: 7950.00, 
    category: "Gasoline"
  },
  { 
    id: "rev9", 
    date: "2023-06-05", 
    source: "Fuel Sales", 
    amount: 8100.00, 
    category: "Gasoline"
  },
  { 
    id: "rev10", 
    date: "2023-06-05", 
    source: "Store Sales", 
    amount: 980.00, 
    category: "Merchandise"
  },
  { 
    id: "rev11", 
    date: "2023-06-06", 
    source: "Fuel Sales", 
    amount: 8300.00, 
    category: "Gasoline"
  },
  { 
    id: "rev12", 
    date: "2023-06-06", 
    source: "Car Wash", 
    amount: 520.00, 
    category: "Services"
  },
  { 
    id: "rev13", 
    date: "2023-06-07", 
    source: "Fuel Sales", 
    amount: 8600.00, 
    category: "Gasoline"
  },
  { 
    id: "rev14", 
    date: "2023-06-07", 
    source: "Store Sales", 
    amount: 1250.00, 
    category: "Merchandise"
  },
];

const dailyRevenueData = [
  { day: "June 1", fuel: 8500.00 + 0, store: 1200.00, total: 8500.00 + 1200.00 },
  { day: "June 2", fuel: 7800.00, store: 950.00, total: 7800.00 + 950.00 },
  { day: "June 3", fuel: 8200.00, store: 450.00, total: 8200.00 + 450.00 },
  { day: "June 4", fuel: 7950.00, store: 1100.00, total: 7950.00 + 1100.00 },
  { day: "June 5", fuel: 8100.00, store: 980.00, total: 8100.00 + 980.00 },
  { day: "June 6", fuel: 8300.00, store: 520.00, total: 8300.00 + 520.00 },
  { day: "June 7", fuel: 8600.00, store: 1250.00, total: 8600.00 + 1250.00 },
];

export default function Revenue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const { data: apiRevenueData, isLoading, error } = useQuery({
    queryKey: ['revenue', dateRange?.from, dateRange?.to],
    queryFn: async () => {
      if (dateRange?.from && dateRange?.to) {
        const startDate = dateRange.from.toISOString().split('T')[0];
        const endDate = dateRange.to.toISOString().split('T')[0];
        const response = await api.revenue.getAll();
        
        if (!response.success) {
          toast.error("Failed to load revenue data: " + response.error);
          return { transactions: revenueData as RevenueTransaction[], summary: null };
        }
        
        return { 
          transactions: (response.data as RevenueTransaction[]) || (revenueData as RevenueTransaction[]),
          summary: null 
        };
      }
      
      return { transactions: revenueData as RevenueTransaction[], summary: null };
    },
    initialData: { transactions: revenueData as RevenueTransaction[], summary: null }
  });

  const transactions: RevenueTransaction[] = apiRevenueData?.transactions || [];

  const categories = Array.from(new Set(transactions.map(rev => rev.category)));

  const filteredRevenue = transactions.filter((rev) => {
    const matchesSearch = rev.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || rev.category === selectedCategory;
    
    const revDate = new Date(rev.date);
    const matchesDateRange = 
      (!dateRange?.from || revDate >= dateRange.from) && 
      (!dateRange?.to || revDate <= dateRange.to);
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const totalRevenue = filteredRevenue.reduce((sum, rev) => sum + rev.amount, 0);
  
  const revenueByCategory = filteredRevenue.reduce((acc, rev) => {
    acc[rev.category] = (acc[rev.category] || 0) + rev.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleExportReport = () => {
    toast.success("Report exported successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Revenue Analysis</h1>
        <Button className="shrink-0" onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading revenue data...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-300">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">
              Error loading revenue data. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / (filteredRevenue.length > 0 ? 
                new Set(filteredRevenue.map(rev => rev.date)).size : 1)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Average daily revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(revenueByCategory).length > 0 
                ? Object.entries(revenueByCategory)
                    .sort((a, b) => b[1] - a[1])[0][0]
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(revenueByCategory).length > 0 
                ? `${(Object.entries(revenueByCategory)
                    .sort((a, b) => b[1] - a[1])[0][1] / totalRevenue * 100).toFixed(1)}% of total`
                : "No data available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                {selectedCategory || "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue Trend</CardTitle>
          <CardDescription>
            Revenue breakdown by day for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={dailyRevenueData}
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
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="fuel" name="Fuel Revenue" fill="#0284c7" />
                <Bar dataKey="store" name="Store Revenue" fill="#84cc16" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Transactions</CardTitle>
          <CardDescription>
            Detailed record of all revenue sources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRevenue.map((rev) => (
                <TableRow key={rev._id || `rev-${rev.date}-${rev.source}`}>
                  <TableCell>{new Date(rev.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{rev.source}</TableCell>
                  <TableCell>{rev.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                      ${rev.amount.toFixed(2)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
          <CardDescription>
            Breakdown of revenue across different categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(revenueByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{category}</p>
                    <p className="text-sm text-muted-foreground">
                      {((amount / totalRevenue) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden mr-4">
                      <div 
                        className="h-full bg-primary" 
                        style={{width: `${(amount / totalRevenue) * 100}%`}}
                      />
                    </div>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
