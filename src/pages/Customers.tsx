import { useState, useEffect } from "react";
import { Plus, Search, Filter, Mail, MoreHorizontal } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Customer } from "@/types/customer";

// Function to generate initials from a name
const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  // Fetch customers data
  const fetchCustomers = async () => {
    setLoading(true);
    console.log('Fetching customers...');
    
    try {
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      // Access the customers collection directly from the customer database
      // Still using admin authentication
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/customer-db/profiles${statusFilter ? `?status=${statusFilter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        console.log(`Successfully fetched ${data.length} customers from customer database`);
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers:', data.message || 'Unknown error');
        toast({
          title: "Error",
          description: "Failed to load customers data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  // Handle customer status update
  const handleUpdateStatus = async (customerId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Customer status updated to ${newStatus}`
        });
        fetchCustomers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update customer status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the customer",
        variant: "destructive"
      });
    }
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer removed successfully"
        });
        fetchCustomers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete customer",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "An error occurred while removing the customer",
        variant: "destructive"
      });
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCustomer(undefined);
    fetchCustomers();
  };

  // Update loyalty points
  const handleUpdateLoyaltyPoints = async (customerId: string, operation: string, amount: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/customers/${customerId}/loyalty`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: amount,
          operation: operation as 'add' | 'subtract' | 'set'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Loyalty points ${operation}ed successfully`
        });
        fetchCustomers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update loyalty points",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating loyalty points",
        variant: "destructive"
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get full name from customer
  const getFullName = (customer: any): string => {
    if (!customer) return "";
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    const name = getFullName(customer).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.status && customer.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.vehicle && customer.vehicle.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Count customers by status
  const regularCustomers = customers.filter(cust => cust.status === "regular").length;
  const premiumCustomers = customers.filter(cust => cust.status === "premium").length;
  const newCustomers = customers.filter(cust => cust.status === "new").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email All
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Regular Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customers.length > 0 ? ((regularCustomers / customers.length) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customers.length > 0 ? ((premiumCustomers / customers.length) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Customers</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("premium")}>Premium Members</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("regular")}>Regular Customers</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("new")}>New Customers</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            Manage your customer relationships and loyalty programs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                          <AvatarFallback>{getInitials(getFullName(customer))}</AvatarFallback>
                      </Avatar>
                      <div>
                          <div className="font-medium">{getFullName(customer)}</div>
                          <div className="text-xs text-muted-foreground">Since {formatDate(customer.memberSince || customer.createdAt)}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                          customer.status === "premium"
                          ? "default"
                            : customer.status === "regular"
                          ? "outline"
                          : "secondary"
                      }
                    >
                        {customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1) : "N/A"}
                    </Badge>
                  </TableCell>
                    <TableCell>{(customer.loyaltyPoints || 0).toLocaleString()}</TableCell>
                    <TableCell>{formatDate(customer.lastVisit)}</TableCell>
                    <TableCell>{customer.vehicle || "N/A"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                        <div>{customer.email || "No email"}</div>
                        <div className="text-muted-foreground">{customer.phone || "No phone"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                            Edit Details
                          </DropdownMenuItem>
                        <DropdownMenuItem>Purchase History</DropdownMenuItem>
                        <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateLoyaltyPoints(customer._id!, 'add', 50)}>
                            Add Loyalty Points
                          </DropdownMenuItem>
                          {customer.status !== 'premium' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(customer._id!, 'premium')}>
                              Upgrade to Premium
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteCustomer(customer._id!)}
                          >
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer details to add them to your database.
            </DialogDescription>
          </DialogHeader>
          
          <CustomerForm 
            onSuccess={handleFormSuccess}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information in your database.
            </DialogDescription>
          </DialogHeader>
          
          <CustomerForm 
            customer={selectedCustomer}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
