import { useState, useEffect } from "react";
import { Search, Plus, Filter, Clock, MoreHorizontal, Wrench, CheckCircle, AlertTriangle } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { MaintenanceTask } from "@/types/maintenance";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { MaintenanceForm } from "@/components/maintenance/MaintenanceForm";

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  // Fetch maintenance tasks
  const fetchTasks = async () => {
    setLoading(true);
    console.log('Fetching maintenance tasks...');
    
    try {
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await api.maintenance.getAll(params);
      
      if (response.success && response.data) {
        console.log(`Successfully fetched ${response.data.length} maintenance tasks`);
        setTasks(response.data);
      } else {
        console.error('Failed to fetch maintenance tasks:', response.error);
        toast({
          title: "Error",
          description: "Failed to load maintenance tasks",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
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
    fetchTasks();
  }, [statusFilter]);

  // Update task status
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.maintenance.updateStatus(taskId, newStatus);
      
      if (response.success) {
        toast({
          title: "Success",
          description: `Task status updated to ${newStatus}`
        });
        fetchTasks();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update task status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the task",
        variant: "destructive"
      });
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await api.maintenance.delete(taskId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Maintenance task deleted successfully"
        });
        fetchTasks();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete maintenance task",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the task",
        variant: "destructive"
      });
    }
  };

  // Handle edit task
  const handleEditTask = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.assignedTo && 
      typeof task.assignedTo === 'object' && 
      (`${task.assignedTo.firstName} ${task.assignedTo.lastName}`).toLowerCase().includes(searchQuery.toLowerCase())) ||
    task.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.location && task.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Count tasks by status
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;
  const pendingTasks = tasks.filter(task => task.status === "pending").length;
  const totalTasks = tasks.length;
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format date function
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get assigned person name
  const getAssignedName = (assignedTo: any): string => {
    if (!assignedTo) return "Unassigned";
    if (typeof assignedTo === 'object') {
      return `${assignedTo.firstName} ${assignedTo.lastName}`;
    }
    return "Unassigned";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Maintenance Management</h1>
        <Button className="shrink-0" onClick={() => {
          setSelectedTask(null);
          setIsModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{completionPercentage}%</span>
                <span className="text-xs text-muted-foreground">Tasks completed</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} out of {totalTasks} tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Upcoming tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter ? `Filter: ${statusFilter.replace('_', ' ')}` : 'Filter'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Tasks</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed Tasks</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("deferred")}>Deferred</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tasks</CardTitle>
          <CardDescription>
            Track and manage all maintenance tasks for your station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading maintenance tasks...
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No maintenance tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{task.title}</span>
                      <span className="text-xs text-muted-foreground">{task.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                          task.status === "completed"
                          ? "default"
                            : task.status === "in_progress"
                          ? "outline"
                          : "secondary"
                      }
                      className="flex w-fit items-center gap-1"
                    >
                        {task.status === "completed" ? (
                        <CheckCircle className="h-3 w-3" />
                        ) : task.status === "in_progress" ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <Wrench className="h-3 w-3" />
                      )}
                        {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                          task.priority === "critical"
                          ? "destructive"
                            : task.priority === "high"
                          ? "outline"
                          : "secondary"
                      }
                      className="flex w-fit items-center gap-1"
                    >
                        {task.priority === "critical" && <AlertTriangle className="h-3 w-3" />}
                      {task.priority}
                    </Badge>
                  </TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>{getAssignedName(task.assignedTo)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit Task</DropdownMenuItem>
                          {task.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(task._id!, 'completed')}>
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {task.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(task._id!, 'in_progress')}>
                              Start Progress
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteTask(task._id!)}
                          >
                            Delete Task
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

      {/* Task form modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Edit Maintenance Task" : "Create New Maintenance Task"}
            </DialogTitle>
            <DialogDescription>
              {selectedTask 
                ? "Update the details of this maintenance task." 
                : "Add a new maintenance task to track."}
            </DialogDescription>
          </DialogHeader>
          
          <MaintenanceForm 
            task={selectedTask || undefined} 
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
