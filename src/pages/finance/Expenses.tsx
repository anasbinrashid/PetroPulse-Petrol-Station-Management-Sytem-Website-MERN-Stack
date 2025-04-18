
import { useState } from "react";
import { Search, Filter, Download, Plus, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

// Mock data for expenses
const expensesData = [
  { 
    id: "exp1", 
    date: "2023-06-05", 
    description: "Fuel Delivery", 
    category: "Inventory", 
    amount: 12500.00, 
    paymentMethod: "Bank Transfer", 
    status: "Paid",
    vendor: "PetroMax Inc."
  },
  { 
    id: "exp2", 
    date: "2023-06-10", 
    description: "Electricity Bill", 
    category: "Utilities", 
    amount: 1450.75, 
    paymentMethod: "AutoPay", 
    status: "Paid",
    vendor: "City Power Co."
  },
  { 
    id: "exp3", 
    date: "2023-06-15", 
    description: "Staff Salaries", 
    category: "Personnel", 
    amount: 8500.00, 
    paymentMethod: "Direct Deposit", 
    status: "Paid",
    vendor: "Internal"
  },
  { 
    id: "exp4", 
    date: "2023-06-20", 
    description: "Store Supplies", 
    category: "Supplies", 
    amount: 750.25, 
    paymentMethod: "Credit Card", 
    status: "Paid",
    vendor: "Office Depot"
  },
  { 
    id: "exp5", 
    date: "2023-06-25", 
    description: "Maintenance Services", 
    category: "Maintenance", 
    amount: 1200.00, 
    paymentMethod: "Check", 
    status: "Pending",
    vendor: "ServiceTech Inc."
  },
  { 
    id: "exp6", 
    date: "2023-07-01", 
    description: "Insurance Premium", 
    category: "Insurance", 
    amount: 2200.00, 
    paymentMethod: "AutoPay", 
    status: "Upcoming",
    vendor: "SafeGuard Insurance"
  },
  { 
    id: "exp7", 
    date: "2023-07-05", 
    description: "Advertising", 
    category: "Marketing", 
    amount: 500.00, 
    paymentMethod: "Credit Card", 
    status: "Upcoming",
    vendor: "LocalAds Agency"
  },
  { 
    id: "exp8", 
    date: "2023-07-10", 
    description: "Property Tax", 
    category: "Taxes", 
    amount: 3500.00, 
    paymentMethod: "Bank Transfer", 
    status: "Upcoming",
    vendor: "City Hall"
  },
];

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Get unique categories and statuses
  const categories = Array.from(new Set(expensesData.map(expense => expense.category)));
  const statuses = Array.from(new Set(expensesData.map(expense => expense.status)));

  // Filter expenses based on search, category, status, and date
  const filteredExpenses = expensesData.filter((expense) => {
    // Check search query
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check category and status
    const matchesCategory = selectedCategory === null || expense.category === selectedCategory;
    const matchesStatus = selectedStatus === null || expense.status === selectedStatus;
    
    // Check date range
    const expenseDate = new Date(expense.date);
    const matchesDateRange = 
      (!dateRange?.from || expenseDate >= dateRange.from) && 
      (!dateRange?.to || expenseDate <= dateRange.to);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  // Calculate summary
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = filteredExpenses
    .filter(expense => expense.status === "Paid")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses
    .filter(expense => expense.status === "Pending")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const upcomingExpenses = filteredExpenses
    .filter(expense => expense.status === "Upcoming")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddExpense = () => {
    toast.success("Feature coming soon", {
      description: "Add expense functionality will be implemented in a future update."
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <Button className="shrink-0" onClick={handleAddExpense}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paidExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalExpenses ? ((paidExpenses / totalExpenses) * 100).toFixed(1) : "0"}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalExpenses ? ((pendingExpenses / totalExpenses) * 100).toFixed(1) : "0"}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${upcomingExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalExpenses ? ((upcomingExpenses / totalExpenses) * 100).toFixed(1) : "0"}% of total</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search expenses..."
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                {selectedStatus || "All Statuses"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedStatus(null)}>All Statuses</DropdownMenuItem>
              {statuses.map(status => (
                <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
                <TableHead>Vendor</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Amount
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
