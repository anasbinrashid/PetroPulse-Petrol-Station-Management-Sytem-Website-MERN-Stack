
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

interface TopSellingProductsProps {
  products: Product[];
}

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Top Selling Products</CardTitle>
        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between border-b border-muted pb-3 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <div className="text-right">
                <div className="font-medium">${product.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{product.sales} units</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
