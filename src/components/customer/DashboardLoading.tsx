
import React from "react";

export const DashboardLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-100px)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-muted-foreground">Loading customer data...</p>
      </div>
    </div>
  );
};
