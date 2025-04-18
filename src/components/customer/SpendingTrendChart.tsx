
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingTrendChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  return (
    <Card className="col-span-2 md:col-span-1">
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              <YAxis 
                label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', offset: -10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                name="Spending" 
                stroke="#3B82F6" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
