
import { useState } from "react";
import { Search, Filter, Download, DollarSign, TrendingUp, TrendingDown, BarChart, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Mock data for expenses
const expensesData = [
  { 
    id: "exp1", 
    date: "2023-06-05", 
    description: "Fuel Delivery", 
    category: "Inventory", 
    amount: 12500.00, 
    paymentMethod: "Bank Transfer", 
    status: "Paid"
  },
  { 
    id: "exp2", 
    date: "2023-06-10", 
    description: "Electricity Bill", 
    category: "Utilities", 
    amount: 1450.75, 
    paymentMethod: "AutoPay", 
    status: "Paid"
  },
  { 
    id: "exp3", 
    date: "2023-06-15", 
    description: "Staff Salaries", 
    category: "Personnel", 
    amount: 8500.00, 
    paymentMethod: "Direct Deposit", 
    status: "Paid"
  },
  { 
    id: "exp4", 
    date: "2023-06-20", 
    description: "Store Supplies", 
    category: "Supplies", 
    amount: 750.25, 
    paymentMethod: "Credit Card", 
    status: "Paid"
  },
  { 
    id: "exp5", 
    date: "2023-06-25", 
    description: "Maintenance Services", 
    category: "Maintenance", 
    amount: 1200.00, 
    paymentMethod: "Check", 
    status: "Pending"
  },
  { 
    id: "exp6", 
    date: "2023-07-01", 
    description: "Insurance Premium", 
    category: "Insurance", 
    amount: 2200.00, 
    paymentMethod: "AutoPay", 
    status: "Upcoming"
  },
  { 
    id: "exp7", 
    date: "2023-07-05", 
    description: "Advertising", 
    category: "Marketing", 
    amount: 500.00, 
    paymentMethod: "Credit Card", 
    status: "Upcoming"
  },
];

// Mock data for revenue
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
];

export default function Finance() {
  const [activeTab, setActiveTab] = useState("expenses");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Filter data based on search query and active tab
  const filteredData = activeTab === "expenses"
    ? expensesData.filter(expense => 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : revenueData.filter(revenue => 
        revenue.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revenue.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Calculate summary statistics
  const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRevenue = revenueData.reduce((sum, revenue) => sum + revenue.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Calculate category breakdowns
  const expensesByCategory = expensesData.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueByCategory = revenueData.reduce((acc, revenue) => {
    acc[revenue.category] = (acc[revenue.category] || 0) + revenue.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <Button className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export Financial Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={netProfit >= 0 ? "border-green-200" : "border-red-200"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {netProfit >= 0 ? (
                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
              )}
              <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${Math.abs(netProfit).toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Income from all sources</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">All payments and costs</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
          <Button variant="outline">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search ${activeTab}...`}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {activeTab === "expenses" ? (
              <>
                <DropdownMenuItem>All Expenses</DropdownMenuItem>
                <DropdownMenuItem>Inventory</DropdownMenuItem>
                <DropdownMenuItem>Utilities</DropdownMenuItem>
                <DropdownMenuItem>Personnel</DropdownMenuItem>
                <DropdownMenuItem>Maintenance</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>All Revenue</DropdownMenuItem>
                <DropdownMenuItem>Fuel Sales</DropdownMenuItem>
                <DropdownMenuItem>Store Sales</DropdownMenuItem>
                <DropdownMenuItem>Services</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {activeTab === "expenses" ? (
        <Card>
          <CardHeader>
            <CardTitle>Expense Transactions</CardTitle>
            <CardDescription>
              Track and categorize all business expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          expense.status === "Paid"
                            ? "default"
                            : expense.status === "Pending"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {expense.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Transactions</CardTitle>
            <CardDescription>
              Track all sources of business revenue.
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
                {filteredData.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell>{new Date(revenue.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{revenue.source}</TableCell>
                    <TableCell>{revenue.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                        ${revenue.amount.toFixed(2)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {activeTab === "expenses" ? "Expenses by Category" : "Revenue by Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(activeTab === "expenses" ? expensesByCategory : revenueByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{category}</p>
                      <p className="text-sm text-muted-foreground">
                        {((amount / (activeTab === "expenses" ? totalExpenses : totalRevenue)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="font-medium">${amount.toFixed(2)}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Record New {activeTab === "expenses" ? "Expense" : "Revenue"}
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Generate Financial Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
