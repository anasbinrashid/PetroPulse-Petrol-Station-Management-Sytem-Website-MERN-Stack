import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileCog, 
  FileText, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface for invoice data
interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

// Mock invoice data
const mockInvoices: Invoice[] = [
  {
    _id: "inv1",
    invoiceNumber: "INV-2023-001",
    date: "2023-05-15",
    dueDate: "2023-06-15",
    total: 125.50,
    status: "paid",
    items: [
      {
        description: "Regular Unleaded - 20 Gallons",
        quantity: 20,
        unitPrice: 3.75,
        total: 75.00
      },
      {
        description: "Oil Change Service",
        quantity: 1,
        unitPrice: 45.00,
        total: 45.00
      },
      {
        description: "Car Wash",
        quantity: 1,
        unitPrice: 5.50,
        total: 5.50
      }
    ]
  },
  {
    _id: "inv2",
    invoiceNumber: "INV-2023-002",
    date: "2023-06-20",
    dueDate: "2023-07-20",
    total: 89.25,
    status: "paid",
    items: [
      {
        description: "Premium Unleaded - 15 Gallons",
        quantity: 15,
        unitPrice: 4.25,
        total: 63.75
      },
      {
        description: "Snacks and Beverages",
        quantity: 1,
        unitPrice: 12.50,
        total: 12.50
      },
      {
        description: "Windshield Wiper Fluid",
        quantity: 1,
        unitPrice: 13.00,
        total: 13.00
      }
    ]
  },
  {
    _id: "inv3",
    invoiceNumber: "INV-2023-003",
    date: "2023-07-10",
    dueDate: "2023-08-10",
    total: 178.95,
    status: "pending",
    items: [
      {
        description: "Diesel - 30 Gallons",
        quantity: 30,
        unitPrice: 4.50,
        total: 135.00
      },
      {
        description: "Engine Diagnostics",
        quantity: 1,
        unitPrice: 35.95,
        total: 35.95
      },
      {
        description: "Air Filter Replacement",
        quantity: 1,
        unitPrice: 8.00,
        total: 8.00
      }
    ]
  },
  {
    _id: "inv4",
    invoiceNumber: "INV-2023-004",
    date: "2023-08-05",
    dueDate: "2023-09-05",
    total: 42.80,
    status: "pending",
    items: [
      {
        description: "Regular Unleaded - 10 Gallons",
        quantity: 10,
        unitPrice: 3.78,
        total: 37.80
      },
      {
        description: "Car Air Freshener",
        quantity: 1,
        unitPrice: 5.00,
        total: 5.00
      }
    ]
  },
  {
    _id: "inv5",
    invoiceNumber: "INV-2023-005",
    date: "2023-04-01",
    dueDate: "2023-05-01",
    total: 250.00,
    status: "overdue",
    items: [
      {
        description: "Monthly Fleet Service Fee",
        quantity: 1,
        unitPrice: 250.00,
        total: 250.00
      }
    ]
  }
];

export default function CustomerInvoices() {
  // State for invoice data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch invoices data
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      
      // In a real app, you would call the API here
      // For now, just use mock data
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setInvoices(mockInvoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);

  // Filter and sort invoices
  const filteredInvoices = invoices.filter(invoice => {
    // Filter by search query
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.items.some(item => 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Filter by date range
    const invoiceDate = new Date(invoice.date);
    const matchesDateRange = 
      (!dateRange?.from || invoiceDate >= dateRange.from) &&
      (!dateRange?.to || invoiceDate <= dateRange.to);
    
    // Filter by status
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesDateRange && matchesStatus;
  }).sort((a, b) => {
    // Sort by selected field
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === "total") {
      return sortDirection === "asc"
        ? a.total - b.total
        : b.total - a.total;
    } else if (sortField === "status") {
      const statusOrder = { paid: 0, pending: 1, overdue: 2 };
      return sortDirection === "asc"
        ? statusOrder[a.status] - statusOrder[b.status]
        : statusOrder[b.status] - statusOrder[a.status];
    } else {
      return 0;
    }
  });
  
  // Paginate invoices
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  
  // Toggle sort direction
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch (e) {
      return dateStr;
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return "bg-green-500 hover:bg-green-500";
      case 'pending': return "bg-amber-500 hover:bg-amber-500";
      case 'overdue': return "bg-red-500 hover:bg-red-500";
      default: return "bg-gray-500 hover:bg-gray-500";
    }
  };
  
  // View invoice details
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };
  
  // Close invoice details
  const closeInvoiceDetails = () => {
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
      </div>

      {/* Filter and Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="space-y-2 flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
              />
            </div>
            
            <div className="space-y-2 min-w-[150px]">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setDateRange(undefined);
              setStatusFilter("");
            }}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            View and manage your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading invoices...</p>
              </div>
            </div>
          ) : selectedInvoice ? (
            // Invoice Details View
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Invoice #{selectedInvoice.invoiceNumber}</h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Date: </span>
                      {formatDate(selectedInvoice.date)}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Due Date: </span>
                      {formatDate(selectedInvoice.dueDate)}
                    </div>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={closeInvoiceDetails}>
                    Back to List
                  </Button>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">${selectedInvoice.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                <p className="text-sm text-muted-foreground">
                  For any payment inquiries or issues, please contact our customer support team at 
                  support@petropulse.com or call (555) 123-4567.
                </p>
              </div>
            </div>
          ) : (
            // Invoices List View
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleSort("date")}
                      >
                        Date
                        {sortField === "date" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-2 h-4 w-4" /> : 
                            <SortDesc className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead className="text-right">
                      <div 
                        className="flex items-center justify-end cursor-pointer"
                        onClick={() => toggleSort("total")}
                      >
                        Amount
                        {sortField === "total" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-2 h-4 w-4" /> : 
                            <SortDesc className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => toggleSort("status")}
                      >
                        Status
                        {sortField === "status" && (
                          sortDirection === "asc" ? 
                            <SortAsc className="ml-2 h-4 w-4" /> : 
                            <SortDesc className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentInvoices.length > 0 ? (
                    currentInvoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell className="text-right font-medium">${invoice.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => viewInvoiceDetails(invoice)}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No invoices found for the selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Label component
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </div>
  );
} 