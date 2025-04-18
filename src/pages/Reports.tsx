import { useEffect, useState } from "react";
import { FileText, Download, BarChart, Calendar, Filter, LineChart, PieChart, Layers, FileBarChart, Receipt, Users, TrendingUp, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Modal from "@/components/ui/Modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { api } from "@/services/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Map of icons by category
const categoryIcons = {
  financial: FileBarChart,
  inventory: ShoppingBag,
  personnel: Users,
  marketing: TrendingUp,
  operations: BarChart,
  default: FileText
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reports, setReports] = useState<any[]>([]); // Ensure reports is initialized as an array
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try the admin reports endpoint first (more detailed)
        let response = await api.admin.getReports();
        
        // If that fails, try the standard reports endpoint
        if (!response.success) {
          console.log("Admin reports failed, trying standard reports endpoint");
          response = await api.reports.getAll();
        }
        
        if (response.success) {
          console.log("Fetched reports:", response.data);
          setReports(Array.isArray(response.data) ? response.data : []);
        } else {
          console.error("Error fetching reports:", response.error);
          setError("Failed to fetch reports");
          toast.error("Failed to load reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to fetch reports");
        toast.error("Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReports();
  }, []);

  const handleView = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDownload = (report: any) => {
    const blob = new Blob([JSON.stringify(report.data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${report.title}.json`;
    link.click();
  };

  const filteredReports = Array.isArray(reports) && activeTab === "all"
    ? reports
    : Array.isArray(reports) 
    ? reports.filter(report => report.category?.toLowerCase() === activeTab.toLowerCase())
    : [];

  // Helper function to get the icon component based on category
  const getIconForReport = (category?: string) => {
    const lowerCategory = (category || '').toLowerCase();
    return categoryIcons[lowerCategory] || categoryIcons.default;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Most Recent</DropdownMenuItem>
              <DropdownMenuItem>Most Used</DropdownMenuItem>
              <DropdownMenuItem>Alphabetical</DropdownMenuItem>
              <DropdownMenuItem>By Category</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:flex">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="personnel">Personnel</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground">No reports found in this category.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const IconComponent = getIconForReport(report.category);
              return (
                <Card key={report._id} className="flex flex-col">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{report.title}</CardTitle>
                      <CardDescription>
                        {report.category || "Uncategorized"} • Last updated: {new Date(report.lastGenerated).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="flex-1 pb-3">
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </CardContent>
                  <CardContent className="pt-0 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleView(report)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(report)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Tabs>

      {isModalOpen && selectedReport && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">{selectedReport.title}</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(selectedReport.data, null, 2)}
          </pre>
        </Modal>
      )}
    </div>
  );
}
