import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

// Function to generate initials from a name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    console.log('Fetching employees...');
    
    try {
      const params: any = {};
      if (department) {
        params.department = department;
      }
      
      // Access the employees collection directly from the employee database
      // Still using admin authentication
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/employee-db/profiles${department ? `?department=${department}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data) {
        console.log(`Successfully fetched ${data.length} employees from employee database`);
        setEmployees(data);
      } else {
        console.error('Failed to fetch employees:', data.message || 'Unknown error');
        toast({
          title: "Error",
          description: "Failed to load employees data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [department]);

  // Handle employee status update
  const handleUpdateStatus = async (employeeId: string, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/employees/${employeeId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Employee status updated to ${newStatus}`
        });
        fetchEmployees();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update employee status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating employee status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the employee",
        variant: "destructive"
      });
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee removed successfully"
        });
        fetchEmployees();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete employee",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "An error occurred while removing the employee",
        variant: "destructive"
      });
    }
  };

  // Handle edit employee
  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get full name from employee
  const getFullName = (employee: any): string => {
    if (!employee) return "";
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    const name = getFullName(employee).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) ||
      (employee.role && employee.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee.status && employee.status.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Count employees by status
  const activeEmployees = employees.filter(emp => emp.status === "active").length;
  const inactiveEmployees = employees.length - activeEmployees;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Button className="shrink-0" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Employee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Currently employed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Ready for duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Leave/Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveEmployees}</div>
            <p className="text-xs text-muted-foreground">Temporarily unavailable</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              {department ? `Department: ${department}` : "Filter"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDepartment(null)}>All Employees</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDepartment("management")}>Management</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDepartment("cashier")}>Cashiers</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDepartment("maintenance")}>Maintenance</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDepartment("fuel")}>Fuel Attendants</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            Manage your station staff and their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading employees...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                          <AvatarFallback>{getInitials(getFullName(employee))}</AvatarFallback>
                      </Avatar>
                        <span className="font-medium">{getFullName(employee)}</span>
                    </div>
                  </TableCell>
                    <TableCell>{employee.role || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                          employee.status === "active"
                          ? "default"
                            : employee.status === "on_leave"
                          ? "outline"
                          : "secondary"
                      }
                    >
                        {employee.status ? employee.status.replace('_', ' ') : "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                        <div>{employee.email || "No email"}</div>
                        <div className="text-muted-foreground">{employee.phone || "No phone"}</div>
                    </div>
                  </TableCell>
                    <TableCell>{formatDate(employee.startDate)}</TableCell>
                    <TableCell>{employee.shift || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                            Edit Details
                          </DropdownMenuItem>
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Performance Review</DropdownMenuItem>
                          {employee.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(employee._id, 'active')}>
                              Mark as Active
                            </DropdownMenuItem>
                          )}
                          {employee.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(employee._id, 'on_leave')}>
                              Mark as On Leave
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteEmployee(employee._id)}
                          >
                            Remove Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to your station staff.
            </DialogDescription>
          </DialogHeader>
          
          <EmployeeForm 
            onSuccess={() => {
              setIsAddModalOpen(false);
              fetchEmployees();
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          
          <EmployeeForm 
            employee={selectedEmployee}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
              fetchEmployees();
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
