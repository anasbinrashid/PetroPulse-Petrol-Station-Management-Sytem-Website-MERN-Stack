import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ShoppingCart,
  Loader2
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
import { addDays, format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/services/api";

// Define Transaction interface
interface Transaction {
  _id: string;
  transactionType: 'fuel' | 'product' | 'service';
  customerId?: string;
  employeeId?: string;
  date: string;
  items: Array<{
    itemType: 'fuel' | 'product';
    itemId?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  notes?: string;
}

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Prepare date params if available
        let params = {};
        if (dateRange?.from && dateRange?.to) {
          params = {
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString()
          };
        }

        const response = await api.sales.getAll();
        
        if (response.success && response.data) {
          setTransactions(response.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch transactions data",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "An error occurred while loading transactions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [dateRange]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy-MM-dd HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  // Filter transactions based on search query, type, and date
  const filteredTransactions = transactions.filter((transaction) => {
    // Check search query (search in payment method and transaction type)
    const matchesSearch = transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check transaction type
    const matchesType = transactionType === null || transaction.transactionType === transactionType;
    
    return matchesSearch && matchesType;
  });

  // Calculate summary statistics
  const totalSales = filteredTransactions.filter(tx => tx.paymentStatus === "paid").reduce((sum, tx) => sum + tx.total, 0);
  const fuelSales = filteredTransactions
    .filter(tx => tx.transactionType === "fuel" && tx.paymentStatus === "paid")
    .reduce((sum, tx) => sum + tx.total, 0);
  const productSales = filteredTransactions
    .filter(tx => tx.transactionType === "product" && tx.paymentStatus === "paid")
    .reduce((sum, tx) => sum + tx.total, 0);

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
            <CardTitle className="text-sm font-medium">Product Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${productSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{totalSales ? ((productSales / totalSales) * 100).toFixed(1) : "0"}% of total</p>
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
                {transactionType ? `Type: ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}` : "All Types"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTransactionType(null)}>All Transactions</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransactionType("fuel")}>Fuel Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransactionType("product")}>Product Only</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransactionType("service")}>Service Only</DropdownMenuItem>
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
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-medium">{transaction._id.substring(0, 8)}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.items.length === 1 
                        ? `${transaction.items[0].quantity} x $${transaction.items[0].unitPrice.toFixed(2)}`
                        : `${transaction.items.length} items`
                      }
                    </TableCell>
                    <TableCell>${transaction.total.toFixed(2)}</TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>
                      {transaction.paymentStatus === "paid" ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Paid
                        </Badge>
                      ) : transaction.paymentStatus === "pending" ? (
                        <Badge variant="default" className="bg-yellow-500">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-red-500">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
