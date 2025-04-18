import { useState, useEffect } from "react";
import { Fuel, Search, Filter, ArrowUpDown, PlusCircle } from "lucide-react";
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
import { toast } from "sonner";
import { api } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FuelInventoryForm } from "@/components/fuel/FuelInventoryForm";
import { FuelInventory as FuelInventoryType } from "@/types/api";

export default function FuelInventory() {
  const [fuels, setFuels] = useState<FuelInventoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Modal states
  const [addFuelOpen, setAddFuelOpen] = useState(false);
  const [editFuelOpen, setEditFuelOpen] = useState(false);
  const [currentFuel, setCurrentFuel] = useState<FuelInventoryType | null>(null);

  // Fetch fuel inventory when component mounts
  useEffect(() => {
    fetchFuelInventory();
  }, []);

  const fetchFuelInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.fuelInventory.getAll();
      if (response.success) {
        setFuels(response.data as FuelInventoryType[]);
      } else {
        setError(response.error || 'Failed to fetch fuel inventory');
        toast.error('Failed to fetch fuel inventory');
      }
    } catch (err) {
      console.error('Error fetching fuel inventory:', err);
      setError('Failed to fetch fuel inventory');
      toast.error('Failed to fetch fuel inventory');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter function for fuel
  const filteredItems = fuels.filter(fuel => {
    const searchMatch = 
      fuel.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fuel.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If we have a filter selected, apply that as well
    if (selectedFilter) {
      if (selectedFilter === 'low' && fuel.currentLevel > fuel.reorderLevel) {
        return false;
      }
      if (selectedFilter === 'available' && fuel.status !== 'available') {
        return false;
      }
      if (selectedFilter === 'maintenance' && fuel.status !== 'maintenance') {
        return false;
      }
    }
    
    return searchMatch;
  });

  // Get unique suppliers
  const suppliers = Array.from(new Set(fuels.map(fuel => fuel.supplier)));

  const handleAddFuel = () => {
    setCurrentFuel(null);
    setAddFuelOpen(true);
  };

  const handleEditFuel = (fuel: FuelInventoryType) => {
    setCurrentFuel(fuel);
    setEditFuelOpen(true);
  };

  const handleOrderFuel = async (fuelId: string, fuelType: string) => {
    try {
      // Get the current fuel
      const fuel = fuels.find(f => f._id === fuelId);
      if (!fuel) return;
      
      // Calculate how much we need to order
      const currentPercent = fuel.currentLevel / fuel.capacity;
      if (currentPercent > 0.5) {
        toast.info("Tank is more than 50% full. No need to refill yet.");
        return;
      }
      
      // Order enough to fill up to 90% capacity
      const amountToOrder = Math.round((0.9 * fuel.capacity) - fuel.currentLevel);
      
      // Update the level
      const response = await api.fuelInventory.updateLevel(fuelId, {
        amount: amountToOrder,
        operation: 'add'
      });
      
      if (response.success) {
        toast.success(`Fuel order placed for ${fuelType}`, {
          description: `Added ${amountToOrder} gallons to the tank.`
        });
        
        // Refresh fuel inventory list
        fetchFuelInventory();
      } else {
        toast.error(`Failed to order ${fuelType}: ${response.error}`);
      }
    } catch (err) {
      console.error('Error ordering fuel:', err);
      toast.error(`Failed to order ${fuelType}`);
    }
  };

  // Calculate totals for the summary cards
  const totalCapacity = fuels.reduce((sum, fuel) => sum + fuel.capacity, 0);
  const totalCurrentLevel = fuels.reduce((sum, fuel) => sum + fuel.currentLevel, 0);
  const percentFilled = totalCapacity > 0 ? (totalCurrentLevel / totalCapacity) * 100 : 0;
  
  // Get the date of the last refill
  const lastRefill = fuels.length > 0 
    ? fuels.reduce((latest, fuel) => {
        if (!fuel.lastRefillDate) return latest;
        const date = new Date(fuel.lastRefillDate);
        return date > latest ? date : latest;
      }, new Date(0))
    : null;
  
  const lastRefillFuel = lastRefill && lastRefill.getTime() > 0
    ? fuels.find(fuel => fuel.lastRefillDate && new Date(fuel.lastRefillDate).getTime() === lastRefill.getTime())
    : null;

  if (isLoading && fuels.length === 0) {
    return <div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>;
  }

  if (error && fuels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchFuelInventory}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Fuel Inventory Management</h1>
        <Button className="shrink-0" onClick={handleAddFuel}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Fuel Type
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()} gal</div>
            <p className="text-xs text-muted-foreground">Across all tanks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrentLevel.toLocaleString()} gal</div>
            <p className="text-xs text-muted-foreground">{percentFilled.toFixed(1)}% of capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastRefill && lastRefill.getTime() > 0 
                ? lastRefill.toLocaleDateString() 
                : "No deliveries yet"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastRefillFuel ? lastRefillFuel.fuelType : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search fuels..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              {selectedFilter === 'low' ? 'Low Stock' : 
               selectedFilter === 'available' ? 'Available' :
               selectedFilter === 'maintenance' ? 'Maintenance' : 'All Fuel'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedFilter(null)}>
              All Fuel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter('low')}>
              Low Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter('available')}>
              Available
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter('maintenance')}>
              Maintenance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fuel Inventory</CardTitle>
          <CardDescription>
            Manage your fuel types, stock levels, and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && fuels.length > 0 && (
            <div className="flex justify-center my-4">
              <Spinner />
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fuel Type</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Stock Level
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Price
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery || selectedFilter ? "No matching fuel items found" : "No fuel items available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((fuel) => (
                  <TableRow key={fuel._id}>
                    <TableCell className="font-medium capitalize">{fuel.fuelType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${fuel.currentLevel / fuel.capacity < 0.2 ? 'bg-red-500' : 'bg-primary'}`} 
                            style={{width: `${(fuel.currentLevel / fuel.capacity) * 100}%`}}
                          />
                        </div>
                        <span>{Math.round((fuel.currentLevel / fuel.capacity) * 100)}%</span>
                        {fuel.currentLevel <= fuel.reorderLevel && (
                          <Badge variant="destructive" className="ml-1">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{fuel.currentLevel.toLocaleString()} / {fuel.capacity.toLocaleString()} gal</TableCell>
                    <TableCell>${fuel.pricePerGallon.toFixed(2)}/gal</TableCell>
                    <TableCell>{fuel.supplier}</TableCell>
                    <TableCell>
                      <Badge variant={
                        fuel.status === 'available' ? 'outline' :
                        fuel.status === 'low' ? 'destructive' :
                        fuel.status === 'critical' ? 'destructive' :
                        fuel.status === 'maintenance' ? 'secondary' : 'outline'
                      }>
                        {fuel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleEditFuel(fuel)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant={fuel.currentLevel <= fuel.reorderLevel ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleOrderFuel(fuel._id!, fuel.fuelType)}
                      >
                        Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Fuel Dialog */}
      <Dialog open={addFuelOpen} onOpenChange={setAddFuelOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Fuel Type</DialogTitle>
            <DialogDescription>
              Create a new fuel type in the inventory system.
            </DialogDescription>
          </DialogHeader>
          <FuelInventoryForm 
            onSuccess={() => {
              setAddFuelOpen(false);
              fetchFuelInventory();
            }}
            onCancel={() => setAddFuelOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Fuel Dialog */}
      <Dialog open={editFuelOpen} onOpenChange={setEditFuelOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Fuel</DialogTitle>
            <DialogDescription>
              Update an existing fuel in the inventory system.
            </DialogDescription>
          </DialogHeader>
          {currentFuel && (
            <FuelInventoryForm 
              fuel={currentFuel}
              onSuccess={() => {
                setEditFuelOpen(false);
                fetchFuelInventory();
              }}
              onCancel={() => setEditFuelOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
