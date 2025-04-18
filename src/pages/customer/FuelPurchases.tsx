import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DownloadIcon, 
  FilterIcon, 
  Fuel, 
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { addDays, subMonths, format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fallback mock data if API fails
const mockPurchases = [
  {
    id: "pur1",
    date: "2023-06-30",
    time: "10:30 AM",
    type: "Regular Unleaded",
    gallons: 13.2,
    pricePerGallon: 3.45,
    total: 45.54,
    location: "Main Street Station",
    paymentMethod: "Credit Card"
  },
  {
    id: "pur2",
    date: "2023-06-25",
    time: "09:15 AM",
    type: "Diesel",
    gallons: 23.3,
    pricePerGallon: 3.75,
    total: 87.38,
    location: "Highway 42 Station",
    paymentMethod: "Fleet Card"
  },
  {
    id: "pur3",
    date: "2023-06-22",
    time: "05:45 PM",
    type: "Premium Unleaded",
    gallons: 15.9,
    pricePerGallon: 3.95,
    total: 62.81,
    location: "Main Street Station",
    paymentMethod: "Credit Card"
  },
  {
    id: "pur4",
    date: "2023-06-18",
    time: "02:30 PM",
    type: "Regular Unleaded",
    gallons: 12.0,
    pricePerGallon: 3.45,
    total: 41.40,
    location: "Downtown Station",
    paymentMethod: "Cash"
  },
  {
    id: "pur5",
    date: "2023-06-15",
    time: "11:20 AM",
    type: "Regular Unleaded",
    gallons: 14.5,
    pricePerGallon: 3.45,
    total: 50.03,
    location: "Main Street Station",
    paymentMethod: "Credit Card"
  },
  {
    id: "pur6",
    date: "2023-06-10",
    time: "04:45 PM",
    type: "Diesel",
    gallons: 18.7,
    pricePerGallon: 3.75,
    total: 70.13,
    location: "Highway 42 Station",
    paymentMethod: "Fleet Card"
  },
  {
    id: "pur7",
    date: "2023-06-05",
    time: "08:15 AM",
    type: "Premium Unleaded",
    gallons: 10.8,
    pricePerGallon: 3.95,
    total: 42.66,
    location: "Downtown Station",
    paymentMethod: "Credit Card"
  },
  {
    id: "pur8",
    date: "2023-05-30",
    time: "12:10 PM",
    type: "Regular Unleaded",
    gallons: 12.5,
    pricePerGallon: 3.40,
    total: 42.50,
    location: "Main Street Station",
    paymentMethod: "Cash"
  },
  {
    id: "pur9",
    date: "2023-05-25",
    time: "03:30 PM",
    type: "Diesel",
    gallons: 21.2,
    pricePerGallon: 3.70,
    total: 78.44,
    location: "Highway 42 Station",
    paymentMethod: "Fleet Card"
  },
  {
    id: "pur10",
    time: "10:45 AM",
    date: "2023-05-20",
    type: "Premium Unleaded",
    gallons: 11.5,
    pricePerGallon: 3.90,
    total: 44.85,
    location: "Downtown Station",
    paymentMethod: "Credit Card"
  }
];

// Format date for display
const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
};

export default function FuelPurchases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [selectedFuelType, setSelectedFuelType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  
  // Add state for API data
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGallons: 0,
    totalAmount: 0,
    totalPurchases: 0,
    averageAmount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Fetch data from API
  useEffect(() => {
    const fetchFuelPurchases = async () => {
      setLoading(true);
      
      try {
        // Format dates for API request
        let startDateStr, endDateStr;
        if (dateRange?.from) {
          startDateStr = format(dateRange.from, 'yyyy-MM-dd');
        }
        if (dateRange?.to) {
          endDateStr = format(dateRange.to, 'yyyy-MM-dd');
        }
        
        const response = await api.customer.getFuelPurchases(
          startDateStr,
          endDateStr,
          pagination.page,
          pagination.limit
        );
        
        if (response.success && response.data) {
          setPurchases(response.data.purchases || []);
          setPagination(response.data.pagination || pagination);
          setStats(response.data.stats || stats);
        } else {
          console.error("Failed to fetch fuel purchases:", response.error);
          toast.error("Failed to load fuel purchases");
          
          // Use mock data as fallback
          setPurchases(mockPurchases);
        }
      } catch (error) {
        console.error("Error fetching fuel purchases:", error);
        toast.error("Failed to load fuel purchases");
        
        // Use mock data as fallback
        setPurchases(mockPurchases);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFuelPurchases();
  }, [dateRange, pagination.page, pagination.limit]);

  // Filter purchases based on search query and dropdowns
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = 
      (purchase.fuelType?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (purchase.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (purchase.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesFuelType = !selectedFuelType || purchase.fuelType === selectedFuelType;
    const matchesLocation = !selectedLocation || purchase.location === selectedLocation;
    
    return matchesSearch && matchesFuelType && matchesLocation;
  });

  // Get unique values for dropdown filters
  const fuelTypes = Array.from(new Set(purchases.map(p => p.fuelType).filter(Boolean)));
  const locations = Array.from(new Set(purchases.map(p => p.location).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Fuel Purchases</h1>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Fuel className="mr-2 h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalGallons.toFixed(1)} gal</div>
            </div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Fuel className="mr-2 h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Fuel className="mr-2 h-4 w-4 text-amber-500" />
              <div className="text-2xl font-bold">${stats.averageAmount.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search fuel purchases..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DatePickerWithRange 
            dateRange={dateRange} 
            setDateRange={setDateRange} 
          />
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fuel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fuel Types</SelectItem>
              {fuelTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            View all your fuel purchases and transaction details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading fuel purchases...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Gallons</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase._id}>
                        <TableCell>
                          <div className="font-medium">{formatDate(purchase.date)}</div>
                          <div className="text-xs text-muted-foreground">{purchase.time || ''}</div>
                        </TableCell>
                        <TableCell>{purchase.fuelType}</TableCell>
                        <TableCell>{purchase.gallons.toFixed(1)}</TableCell>
                        <TableCell>${purchase.pricePerGallon.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${purchase.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{purchase.paymentMethod}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No purchases found for the selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({...pagination, page: Math.min(pagination.pages, pagination.page + 1)})}
                    disabled={pagination.page === pagination.pages}
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
