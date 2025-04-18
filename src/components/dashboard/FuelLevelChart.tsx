
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Droplets, AlertTriangle } from "lucide-react";

interface FuelTypeData {
  type: string;
  level: number;
  capacity: number;
  color: string;
}

interface FuelLevelChartProps {
  data: FuelTypeData[];
}

export function FuelLevelChart({ data }: FuelLevelChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Fuel Inventory Levels</CardTitle>
        <Droplets className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((fuel) => {
            const percentage = Math.round((fuel.level / fuel.capacity) * 100);
            const isLow = percentage < 30;
            
            return (
              <div key={fuel.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{fuel.type}</span>
                  <div className="flex items-center">
                    {isLow && (
                      <div className="mr-2 flex items-center text-amber-500">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        <span className="text-xs">Low</span>
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {percentage}% ({fuel.level.toLocaleString()} L / {fuel.capacity.toLocaleString()} L)
                    </span>
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className={cn("h-2", {
                    "bg-blue-200": fuel.color === "blue",
                    "bg-green-200": fuel.color === "green",
                    "bg-yellow-200": fuel.color === "yellow"
                  })}
                  indicatorClassName={cn({
                    "bg-blue-500": fuel.color === "blue" && !isLow,
                    "bg-green-500": fuel.color === "green" && !isLow,
                    "bg-yellow-500": fuel.color === "yellow" && !isLow,
                    "bg-amber-500": isLow
                  })}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
