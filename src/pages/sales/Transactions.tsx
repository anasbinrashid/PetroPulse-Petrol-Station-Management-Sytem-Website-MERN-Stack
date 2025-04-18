
import { useState } from "react";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ShoppingCart 
} from "lucide-react";
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

// Mock data for sales transactions
const salesData = [
  { 
    id: "tx1", 
    date: "2023-07-01 10:30:25", 
    type: "Fuel", 
    product: "Regular Unleaded", 
    quantity: 12.5, 
    unitPrice: 3.45, 
    amount: 43.13, 
    paymentMethod: "Credit Card", 
    employee: "John Smith",
    pumpNumber: 2,
    status: "Completed"
  },
  { 
    id: "tx2", 
    date: "2023-07-01 11:45:10", 
    type: "Fuel", 
    product: "Diesel", 
    quantity: 18.8, 
    unitPrice: 3.75, 
    amount: 70.50, 
    paymentMethod: "Cash", 
    employee: "Mary Johnson",
    pumpNumber: 4,
    status: "Completed"
  },
  { 
    id: "tx3", 
    date: "2023-07-01 12:15:30", 
    type: "Store", 
    product: "Snacks", 
    quantity: 3, 
    unitPrice: 2.50, 
    amount: 7.50, 
    paymentMethod: "Debit Card", 
    employee: "John Smith",
    status: "Completed"
  },
  { 
    id: "tx4", 
    date: "2023-07-01 14:30:45", 
    type: "Fuel", 
    product: "Premium Unleaded", 
    quantity: 15.2, 
    unitPrice: 3.95, 
    amount: 60.04, 
    paymentMethod: "Credit Card", 
    employee: "Sarah Williams",
    pumpNumber: 1,
    status: "Completed"
  },
  { 
    id: "tx5", 
    date: "2023-07-01 15:50:20", 
    type: "Store", 
    product: "Cigarettes", 
    quantity: 1, 
    unitPrice: 8.50, 
    amount: 8.50, 
    paymentMethod: "Cash", 
    employee: "Mary Johnson",
    status: "Completed"
  },
  { 
    id: "tx6", 
    date: "2023-07-02 09:15:05", 
    type: "Fuel", 
    product: "Regular Unleaded", 
    quantity: 10.8, 
    unitPrice: 3.45, 
    amount: 37.26, 
    paymentMethod: "Fleet Card", 
    employee: "Sarah Williams",
    pumpNumber: 3,
    status: "Completed"
  },
  { 
    id: "tx7", 
    date: "2023-07-02 10:25:35", 
    type: "Store", 
    product: "Coffee", 
    quantity: 2, 
    unitPrice: 2.25, 
    amount: 4.50, 
    paymentMethod: "Debit Card", 
    employee: "John Smith",
    status: "Voided",
    voidReason: "Customer changed mind"
  },
  { 
    id: "tx8", 
    date: "2023-07-02 12:40:50", 
    type: "Fuel", 
    product: "Diesel", 
    quantity: 22.5, 
    unitPrice: 3.75, 
    amount: 84.38, 
    paymentMethod: "Credit Card", 
    employee: "Mary Johnson",
    pumpNumber: 4,
    status: "Disputed",
    disputeReason: "Card charged twice"
  },
];

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  // Filter transactions based on search query, type, and date
  const filteredSales = salesData.filter((sale) => {
    // Check search query
    const matchesSearch = sale.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.employee.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check transaction type
    const matchesType = transactionType === null || sale.type === transactionType;
    
    // Check date range
    const saleDate = new Date(sale.date);
    const matchesDateRange = 
      (!dateRange?.from || saleDate >= dateRange.from) && 
      (!dateRange?.to || saleDate <= dateRange.to);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  // Calculate summary statistics
  const totalSales = filteredSales.filter(sale => sale.status === "Completed").reduce((sum, sale) => sum + sale.amount, 0);
  const fuelSales = filteredSales
    .filter(sale => sale.type === "Fuel" && sale.status === "Completed")
    .reduce((sum, sale) => sum + sale.amount, 0);
  const storeSales = filteredSales
    .filter(sale => sale.type === "Store" && sale.status === "Completed")
    .reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Sales Transactions</h1>
        <Button className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
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
            <div className="text-2xl font-bold">${fuelSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalSales ? ((fuelSales / totalSales) * 100).toFixed(1) : "0"}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Store Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${storeSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalSales ? ((storeSales / totalSales) * 100).toFixed(1) : "0"}% of total</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                {transactionType || "All Types"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTransactionType(null)}>All Transactions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransactionType("Fuel")}>Fuel Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransactionType("Store")}>Store Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Detailed record of all sales transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                  <TableCell>{sale.type}</TableCell>
                  <TableCell>{sale.product}</TableCell>
                  <TableCell>
                    {sale.quantity} {sale.type === "Fuel" ? "L" : "units"}
                    {sale.pumpNumber && <span className="ml-1 text-xs text-muted-foreground">(Pump {sale.pumpNumber})</span>}
                  </TableCell>
                  <TableCell>${sale.amount.toFixed(2)}</TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        sale.status === "Completed" ? "default" :
                        sale.status === "Voided" ? "destructive" : "outline"
                      }
                      className="flex items-center gap-1"
                    >
                      {sale.status === "Completed" ? <CheckCircle className="h-3 w-3" /> :
                       sale.status === "Voided" ? <XCircle className="h-3 w-3" /> :
                       <AlertCircle className="h-3 w-3" />}
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.employee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
