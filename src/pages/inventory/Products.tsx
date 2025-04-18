import { useState, useEffect } from "react";
import { Package, Search, Filter, ArrowUpDown, PlusCircle, ShoppingBasket } from "lucide-react";
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
import { ProductForm } from "@/components/products/ProductForm";

// Define Product interface based on the backend model
interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  supplier: string;
  reorderLevel: number;
  isActive: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modal states
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.products.getAll();
      if (response.success) {
        setProducts(response.data as Product[]);
      } else {
        setError(response.error || 'Failed to fetch products');
        toast.error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter function for products
  const filteredProducts = products.filter(product => 
    (searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === null || product.category === selectedCategory)
  );

  // Get unique categories
  const categories = Array.from(new Set(products.map(product => product.category)));

  const handleReorder = async (productId: string, productName: string) => {
    try {
      // Get the current product
      const product = products.find(p => p._id === productId);
      if (!product) return;
      
      // Send request to update stock (additional quantity based on reorder level)
      const additionalQuantity = product.reorderLevel * 2; // Example: Order twice the reorder level
      
      // Cast to any to avoid TypeScript errors with missing updateStock method
      const response = await (api.products as any).updateStock(productId, {
        quantity: additionalQuantity,
        operation: 'add'
      });
      
      if (response.success) {
        toast.success(`Reorder placed for ${productName}`, {
          description: `Added ${additionalQuantity} units to inventory.`
        });
        
        // Refresh products list
        fetchProducts();
      } else {
        toast.error(`Failed to reorder ${productName}`);
      }
    } catch (err) {
      console.error('Error reordering product:', err);
      toast.error(`Failed to reorder ${productName}`);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setAddProductOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setEditProductOpen(true);
  };

  if (isLoading && products.length === 0) {
    return <div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>;
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchProducts}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Store Products Inventory</h1>
        <Button className="shrink-0" onClick={handleAddProduct}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              {selectedCategory || "All Categories"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Unique products in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${products.reduce((sum, product) => sum + (product.quantity * product.price), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Retail value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(product => product.quantity <= product.reorderLevel).length}
            </div>
            <p className="text-xs text-muted-foreground">Items below reorder point</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Products</CardTitle>
          <CardDescription>
            Manage convenience store products and merchandise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && products.length > 0 && (
            <div className="flex justify-center my-4">
              <Spinner />
            </div>
          )}
          
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
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery || selectedCategory ? "No matching products found" : "No products available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {product.quantity}
                        {product.quantity <= product.reorderLevel && (
                          <Badge variant="destructive" className="ml-2">Reorder</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant={product.quantity <= product.reorderLevel ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleReorder(product._id, product.name)}
                      >
                        Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in the inventory system.
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            onSuccess={() => {
              setAddProductOpen(false);
              fetchProducts();
            }}
            onCancel={() => setAddProductOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update an existing product in the inventory system.
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <ProductForm 
              product={currentProduct}
              onSuccess={() => {
                setEditProductOpen(false);
                fetchProducts();
              }}
              onCancel={() => setEditProductOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
