import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Maintenance from '../models/admin/MaintenanceModel';

/**
 * @desc    Get all maintenance tasks
 * @route   GET /api/maintenance
 * @access  Private/Admin
 */
export const getAllMaintenanceTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('API CALL: Fetching all maintenance tasks...');
    console.log('Query params:', JSON.stringify(req.query));
    
    // Parse query parameters for filtering
    const filter: any = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
      console.log(`DEBUG: Filtering by status: ${req.query.status}`);
    }
    
    if (req.query.priority) {
      filter.priority = req.query.priority;
      console.log(`DEBUG: Filtering by priority: ${req.query.priority}`);
    }
    
    if (req.query.category) {
      filter.category = req.query.category;
      console.log(`DEBUG: Filtering by category: ${req.query.category}`);
    }
    
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
      console.log(`DEBUG: Filtering by assigned employee: ${req.query.assignedTo}`);
    }
    
    // Get maintenance tasks with sorting
    console.log('DEBUG: Executing database query with filter:', JSON.stringify(filter));
    const tasks = await Maintenance.find(filter)
      .sort({ dueDate: 1, priority: -1 })
      .populate('assignedTo', 'firstName lastName');
    
    console.log(`SUCCESS: Found ${tasks.length} maintenance tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('ERROR in getAllMaintenanceTasks:', error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ message: 'Error fetching maintenance tasks', error: (error as Error).message });
  }
});

/**
 * @desc    Get maintenance task by ID
 * @route   GET /api/maintenance/:id
 * @access  Private/Admin
 */
export const getMaintenanceTaskById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`API CALL: Fetching maintenance task with ID: ${req.params.id}`);
    
    const task = await Maintenance.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName');
    
    if (task) {
      console.log(`SUCCESS: Found maintenance task: ${task.title}`);
      res.json(task);
    } else {
      console.log(`ERROR: Maintenance task with ID ${req.params.id} not found`);
      res.status(404).json({ message: 'Maintenance task not found' });
    }
  } catch (error) {
    console.error(`ERROR in getMaintenanceTaskById (ID: ${req.params.id}):`, error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ message: 'Error fetching maintenance task', error: (error as Error).message });
  }
});

/**
 * @desc    Create new maintenance task
 * @route   POST /api/maintenance
 * @access  Private/Admin
 */
export const createMaintenanceTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('API CALL: Creating new maintenance task');
    console.log('Request body:', JSON.stringify(req.body));
    
    const {
      title,
      description,
      status,
      priority,
      category,
      assignedTo,
      dueDate,
      estimatedCost,
      location,
      equipment,
      vendorInfo
    } = req.body;
    
    // Set creator
    const adminId = req.user?._id;
    console.log(`DEBUG: Task creation initiated by admin ID: ${adminId}`);
    
    if (!title || !description || !priority || !category) {
      console.log('ERROR: Missing required fields in create maintenance task');
      console.log('Received fields:', Object.keys(req.body).join(', '));
      res.status(400).json({ message: 'Please provide title, description, priority, and category' });
      return;
    }
    
    const taskData = {
      title,
      description,
      status: status || 'pending',
      priority,
      category,
      assignedTo: assignedTo || null,
      createdBy: adminId,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedCost: estimatedCost || 0,
      location,
      equipment,
      vendorInfo
    };
    
    console.log('DEBUG: Creating task with data:', JSON.stringify(taskData));
    const task = await Maintenance.create(taskData);
    
    console.log(`SUCCESS: Maintenance task created with ID: ${task._id}`);
    res.status(201).json(task);
  } catch (error) {
    console.error('ERROR in createMaintenanceTask:', error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ 
      message: 'Error creating maintenance task', 
      error: (error as Error).message,
      details: error instanceof Error && 'code' in error ? (error as any).code : undefined
    });
  }
});

/**
 * @desc    Update maintenance task
 * @route   PUT /api/maintenance/:id
 * @access  Private/Admin
 */
export const updateMaintenanceTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`API CALL: Updating maintenance task with ID: ${req.params.id}`);
    console.log('Request body:', JSON.stringify(req.body));
    
    const task = await Maintenance.findById(req.params.id);
    
    if (!task) {
      console.log(`ERROR: Maintenance task with ID ${req.params.id} not found for update`);
      res.status(404).json({ message: 'Maintenance task not found' });
      return;
    }
    
    console.log('DEBUG: Found task to update:', task.title);
    
    // Update task fields from request body
    const updatableFields = [
      'title', 'description', 'status', 'priority', 'category', 
      'assignedTo', 'dueDate', 'estimatedCost', 'actualCost',
      'location', 'equipment', 'vendorInfo', 'notes'
    ];
    
    const updatedFields: string[] = [];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        const oldValue = task[field];
        
        // Handle date conversion for dueDate
        if (field === 'dueDate' && req.body[field]) {
          task[field] = new Date(req.body[field]);
        } else {
          task[field] = req.body[field];
        }
        
        updatedFields.push(field);
        console.log(`DEBUG: Updated field '${field}': ${oldValue} -> ${task[field]}`);
      }
    });
    
    // If status is completed, set completedDate
    if (req.body.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
      updatedFields.push('completedDate');
      console.log(`DEBUG: Task marked as completed at ${task.completedDate}`);
    }
    
    console.log(`DEBUG: Saving task with updated fields: ${updatedFields.join(', ')}`);
    const updatedTask = await task.save();
    
    console.log(`SUCCESS: Maintenance task updated: ${updatedTask.title}`);
    res.json(updatedTask);
  } catch (error) {
    console.error(`ERROR in updateMaintenanceTask (ID: ${req.params.id}):`, error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ message: 'Error updating maintenance task', error: (error as Error).message });
  }
});

/**
 * @desc    Delete maintenance task
 * @route   DELETE /api/maintenance/:id
 * @access  Private/Admin
 */
export const deleteMaintenanceTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`API CALL: Deleting maintenance task with ID: ${req.params.id}`);
    
    const task = await Maintenance.findById(req.params.id);
    
    if (!task) {
      console.log(`ERROR: Maintenance task with ID ${req.params.id} not found for deletion`);
      res.status(404).json({ message: 'Maintenance task not found' });
      return;
    }
    
    console.log(`DEBUG: Found task to delete: ${task.title}`);
    await task.deleteOne();
    console.log(`SUCCESS: Maintenance task deleted: ${task.title} (${task._id})`);
    res.json({ message: 'Maintenance task removed', id: task._id });
  } catch (error) {
    console.error(`ERROR in deleteMaintenanceTask (ID: ${req.params.id}):`, error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ message: 'Error deleting maintenance task', error: (error as Error).message });
  }
});

/**
 * @desc    Update maintenance task status
 * @route   PATCH /api/maintenance/:id/status
 * @access  Private/Admin
 */
export const updateMaintenanceStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`API CALL: Updating status for maintenance task ID: ${req.params.id}`);
    console.log('Request body:', JSON.stringify(req.body));
    
    const { status } = req.body;
    
    if (!status) {
      console.log('ERROR: Status is required for status update');
      res.status(400).json({ message: 'Status is required' });
      return;
    }
    
    const task = await Maintenance.findById(req.params.id);
    
    if (!task) {
      console.log(`ERROR: Maintenance task with ID ${req.params.id} not found for status update`);
      res.status(404).json({ message: 'Maintenance task not found' });
      return;
    }
    
    console.log(`DEBUG: Current status: ${task.status}, New status: ${status}`);
    
    // Update status
    task.status = status;
    
    // If status is completed, set completedDate
    if (status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
      console.log(`DEBUG: Task marked as completed at ${task.completedDate}`);
    }
    
    const updatedTask = await task.save();
    
    console.log(`SUCCESS: Maintenance task status updated to ${status}`);
    res.json(updatedTask);
  } catch (error) {
    console.error(`ERROR in updateMaintenanceStatus (ID: ${req.params.id}):`, error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ message: 'Error updating maintenance task status', error: (error as Error).message });
  }
}); 