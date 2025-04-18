
import { useState } from "react";
import { Package, Search, Plus, Filter, ArrowUpDown } from "lucide-react";
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

// Mock data for fuel
const fuelData = [
  { id: "f1", type: "Regular Unleaded", stock: 15000, capacity: 20000, price: 3.45, lastDelivery: "2023-06-15" },
  { id: "f2", type: "Premium Unleaded", stock: 8000, capacity: 10000, price: 3.95, lastDelivery: "2023-06-12" },
  { id: "f3", type: "Diesel", stock: 12000, capacity: 15000, price: 3.75, lastDelivery: "2023-06-10" },
  { id: "f4", type: "E85", stock: 4500, capacity: 8000, price: 2.95, lastDelivery: "2023-06-08" },
];

// Mock data for products
const productData = [
  { id: "p1", name: "Motor Oil", category: "Automotive", stock: 125, price: 24.99, supplier: "AutoSupply Inc." },
  { id: "p2", name: "Energy Drink", category: "Beverages", stock: 85, price: 2.49, supplier: "Beverage Central" },
  { id: "p3", name: "Snack Chips", category: "Food", stock: 150, price: 1.99, supplier: "Food Distributors" },
  { id: "p4", name: "Car Wash Coupon", category: "Services", stock: 200, price: 8.99, supplier: "In-house" },
  { id: "p5", name: "Windshield Wipers", category: "Automotive", stock: 45, price: 15.99, supplier: "AutoSupply Inc." },
  { id: "p6", name: "Coffee", category: "Beverages", stock: 110, price: 1.79, supplier: "Beverage Central" },
];

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("fuel");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter function for both fuel and products
  const filteredItems = activeTab === "fuel"
    ? fuelData.filter(fuel => 
        fuel.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : productData.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add New {activeTab === "fuel" ? "Fuel" : "Product"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 md:w-auto">
          <TabsTrigger value="fuel">Fuel Inventory</TabsTrigger>
          <TabsTrigger value="products">Store Products</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${activeTab === "fuel" ? "fuels" : "products"}...`}
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
              {activeTab === "fuel" ? (
                <>
                  <DropdownMenuItem>By Fuel Type</DropdownMenuItem>
                  <DropdownMenuItem>By Stock Level</DropdownMenuItem>
                  <DropdownMenuItem>By Price</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>By Category</DropdownMenuItem>
                  <DropdownMenuItem>By Stock Level</DropdownMenuItem>
                  <DropdownMenuItem>By Supplier</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Inventory</CardTitle>
              <CardDescription>
                Manage your fuel types, stock levels, and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    <TableHead>Last Delivery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((fuel) => (
                    <TableRow key={fuel.id}>
                      <TableCell className="font-medium">{fuel.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{width: `${(fuel.stock / fuel.capacity) * 100}%`}}
                            />
                          </div>
                          <span>{Math.round((fuel.stock / fuel.capacity) * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{fuel.stock} / {fuel.capacity} L</TableCell>
                      <TableCell>${fuel.price.toFixed(2)}/L</TableCell>
                      <TableCell>{new Date(fuel.lastDelivery).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Store Products</CardTitle>
              <CardDescription>
                Manage convenience store products and merchandise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Stock
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Price
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.supplier}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
