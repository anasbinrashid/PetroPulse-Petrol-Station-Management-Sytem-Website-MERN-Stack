import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Employee from '../models/admin/EmployeeModel';
import Attendance from '../models/admin/AttendanceModel';

/**
 * @desc    Get all employees
 * @route   GET /api/admin/employees
 * @access  Private/Admin
 */
export const getAllEmployees = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching all employees...');
    
    // Parse query parameters for filtering
    const filter: any = {};
    
    if (req.query.department) {
      filter.department = req.query.department;
      console.log(`Filtering by department: ${req.query.department}`);
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
      console.log(`Filtering by status: ${req.query.status}`);
    }
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { position: searchRegex },
        { employeeId: searchRegex }
      ];
      console.log(`Searching for: ${req.query.search}`);
    }
    
    // Get employees with sorting
    const employees = await Employee.find(filter)
      .select('-password')
      .sort({ lastName: 1, firstName: 1 });
    
    console.log(`Found ${employees.length} employees`);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: (error as Error).message });
  }
});

/**
 * @desc    Get employee by ID
 * @route   GET /api/admin/employees/:id
 * @access  Private/Admin
 */
export const getEmployeeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Fetching employee with ID: ${req.params.id}`);
    
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (employee) {
      console.log(`Found employee: ${employee.firstName} ${employee.lastName}`);
      res.json(employee);
    } else {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee', error: (error as Error).message });
  }
});

/**
 * @desc    Create new employee
 * @route   POST /api/admin/employees
 * @access  Private/Admin
 */
export const createEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating new employee:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      position,
      department,
      employeeId,
      hireDate,
      salary,
      status,
      emergencyContact,
      address,
      bankDetails,
      notes,
      permissions
    } = req.body;
    
    // Check for required fields
    if (!firstName || !lastName || !email || !password || !position || !department) {
      console.log('Missing required fields');
      res.status(400).json({ 
        message: 'Please provide all required fields: firstName, lastName, email, password, position, department' 
      });
      return;
    }
    
    // Check if employee with this email already exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      console.log('Employee with this email already exists');
      res.status(400).json({ message: 'Employee with this email already exists' });
      return;
    }
    
    // Check if employee with this employeeId already exists
    if (employeeId) {
      const employeeIdExists = await Employee.findOne({ employeeId });
      if (employeeIdExists) {
        console.log('Employee with this ID already exists');
        res.status(400).json({ message: 'Employee with this ID already exists' });
        return;
      }
    }
    
    // Create employee - store password directly without hashing
    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      password: password, // Store password directly
      phone,
      position,
      department,
      employeeId: employeeId || `EMP${Date.now().toString().slice(-6)}`,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      salary,
      status: status || 'active',
      emergencyContact,
      address,
      bankDetails,
      notes,
      permissions
    });
    
    if (employee) {
      console.log(`Employee created with ID: ${employee._id}`);
      res.status(201).json({
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        employeeId: employee.employeeId,
        hireDate: employee.hireDate,
        status: employee.status
      });
    } else {
      console.log('Invalid employee data');
      res.status(400).json({ message: 'Invalid employee data' });
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee', error: (error as Error).message });
  }
});

/**
 * @desc    Update employee
 * @route   PUT /api/admin/employees/:id
 * @access  Private/Admin
 */
export const updateEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating employee with ID: ${req.params.id}`);
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // Update employee fields from request body
    const updatableFields = [
      'firstName', 'lastName', 'email', 'phone', 'position', 'department',
      'employeeId', 'hireDate', 'salary', 'status', 'emergencyContact',
      'address', 'bankDetails', 'notes', 'permissions', 'profileImage', 'password'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Handle date conversions
        if (field === 'hireDate' && req.body[field]) {
          employee[field] = new Date(req.body[field]);
        } else {
          employee[field] = req.body[field];
        }
      }
    });
    
    const updatedEmployee = await employee.save();
    
    console.log(`Employee updated: ${updatedEmployee.firstName} ${updatedEmployee.lastName}`);
    res.json({
      _id: updatedEmployee._id,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone,
      position: updatedEmployee.position,
      department: updatedEmployee.department,
      employeeId: updatedEmployee.employeeId,
      hireDate: updatedEmployee.hireDate,
      status: updatedEmployee.status,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee', error: (error as Error).message });
  }
});

/**
 * @desc    Delete employee
 * @route   DELETE /api/admin/employees/:id
 * @access  Private/Admin
 */
export const deleteEmployee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Deleting employee with ID: ${req.params.id}`);
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // First delete associated attendance records
    await Attendance.deleteMany({ employee: employee._id });
    console.log(`Deleted attendance records for employee: ${employee._id}`);
    
    // Delete the employee record
    await employee.deleteOne();
    console.log('Employee deleted');
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee', error: (error as Error).message });
  }
});

/**
 * @desc    Get employee attendance records
 * @route   GET /api/admin/employees/:id/attendance
 * @access  Private/Admin
 */
export const getEmployeeAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Fetching attendance for employee ID: ${req.params.id}`);
    
    // Parse query parameters for date range
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30));
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // First check if employee exists
    const employee = await Employee.findById(req.params.id).select('-password');
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // Find attendance records for the employee
    const attendance = await Attendance.find({
      employee: req.params.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    console.log(`Found ${attendance.length} attendance records for employee ${employee.firstName} ${employee.lastName}`);
    
    // Calculate summary statistics
    const total = attendance.length;
    const present = attendance.filter(record => record.status === 'present').length;
    const absent = attendance.filter(record => record.status === 'absent').length;
    const late = attendance.filter(record => record.status === 'late').length;
    const totalHours = attendance.reduce((sum, record) => sum + (record.hours || 0), 0);
    
    res.json({
      employee,
      attendance,
      summary: {
        total,
        present,
        absent,
        late,
        totalHours: parseFloat(totalHours.toFixed(2)),
        attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : '0'
      }
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ message: 'Error fetching employee attendance', error: (error as Error).message });
  }
});

/**
 * @desc    Add attendance record for employee
 * @route   POST /api/admin/employees/:id/attendance
 * @access  Private/Admin
 */
export const addEmployeeAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Adding attendance record for employee ID: ${req.params.id}`);
    
    const { date, status, clockIn, clockOut, hours, notes } = req.body;
    
    if (!date || !status) {
      console.log('Missing required fields');
      res.status(400).json({ message: 'Please provide date and status' });
      return;
    }
    
    // First check if employee exists
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      console.log('Employee not found');
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    
    // Check if attendance record already exists for this date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    const existingRecord = await Attendance.findOne({
      employee: req.params.id,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (existingRecord) {
      console.log('Attendance record already exists for this date');
      res.status(400).json({ message: 'Attendance record already exists for this date' });
      return;
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      employee: req.params.id,
      date: attendanceDate,
      status,
      clockIn: clockIn ? new Date(clockIn) : undefined,
      clockOut: clockOut ? new Date(clockOut) : undefined,
      hours: hours || (clockIn && clockOut ? 
        (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60) : 
        undefined),
      notes
    });
    
    console.log(`Attendance record created with ID: ${attendance._id}`);
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error adding attendance record:', error);
    res.status(500).json({ message: 'Error adding attendance record', error: (error as Error).message });
  }
});

/**
 * @desc    Update attendance record
 * @route   PUT /api/admin/employees/:id/attendance/:attendanceId
 * @access  Private/Admin
 */
export const updateAttendanceRecord = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating attendance record: ${req.params.attendanceId}`);
    
    const { status, clockIn, clockOut, hours, notes } = req.body;
    
    // Check if attendance record exists
    const attendance = await Attendance.findById(req.params.attendanceId);
    
    if (!attendance) {
      console.log('Attendance record not found');
      res.status(404).json({ message: 'Attendance record not found' });
      return;
    }
    
    // Update attendance fields
    if (status) attendance.status = status;
    if (clockIn) attendance.clockIn = new Date(clockIn);
    if (clockOut) attendance.clockOut = new Date(clockOut);
    
    // Calculate hours if clockIn and clockOut are provided
    if (clockIn && clockOut) {
      const hoursWorked = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60);
      attendance.hours = parseFloat(hoursWorked.toFixed(2));
    } else if (hours !== undefined) {
      attendance.hours = hours;
    }
    
    if (notes !== undefined) attendance.notes = notes;
    
    const updatedAttendance = await attendance.save();
    
    console.log(`Attendance record updated: ${updatedAttendance._id}`);
    res.json(updatedAttendance);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ message: 'Error updating attendance record', error: (error as Error).message });
  }
}); 