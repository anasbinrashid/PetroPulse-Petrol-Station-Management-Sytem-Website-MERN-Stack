
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FuelPurchaseBarChartProps {
  data: Array<{
    month: string;
    regular: number;
    premium: number;
    diesel: number;
  }>;
}

export const FuelPurchaseBarChart: React.FC<FuelPurchaseBarChartProps> = ({ data }) => {
  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Monthly Fuel Purchases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Gallons', angle: -90, position: 'insideLeft', offset: -10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="regular" name="Regular" fill="#3B82F6" />
              <Bar dataKey="premium" name="Premium" fill="#10B981" />
              <Bar dataKey="diesel" name="Diesel" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
