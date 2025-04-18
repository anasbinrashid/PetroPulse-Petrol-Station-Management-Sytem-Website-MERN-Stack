import dotenv from 'dotenv';
import connectDB from '../config/db';
import employeeDbConnection from '../config/employeeDb';
import Employee from '../models/employee/EmployeeModel';
import Attendance from '../models/employee/AttendanceModel';

// Models from employee database
import EmployeeProfileConnection from '../models/employeeDB/EmployeeProfileModel';
import ScheduleConnection from '../models/employeeDB/ScheduleModel';
import PayrollConnection from '../models/employeeDB/PayrollModel';
import EmployeeAttendanceConnection from '../models/employeeDB/EmployeeAttendanceModel';

dotenv.config();

/**
 * Utility to sync all employee data from the main database to the employee database
 */
const syncAllEmployeeData = async () => {
  try {
    // Connect to both databases
    console.log('Connecting to databases...');
    await connectDB();
    const conn = await employeeDbConnection;
    
    // Get model instances from employee DB connection
    const EmployeeProfile = await EmployeeProfileConnection;
    const Schedule = await ScheduleConnection;
    const Payroll = await PayrollConnection;
    const EmployeeAttendance = await EmployeeAttendanceConnection;
    
    console.log('Connected to both databases');
    
    // Get all employees from main DB
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees in main database`);
    
    // Process each employee
    for (const employee of employees) {
      console.log(`Processing employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
      
      // Check if employee profile exists in employee DB
      const existingProfile = await EmployeeProfile.findOne({ mainEmployeeId: employee.employeeId });
      
      if (existingProfile) {
        console.log('Employee profile already exists. Updating...');
        
        // Update core details to ensure sync
        existingProfile.firstName = employee.firstName;
        existingProfile.lastName = employee.lastName;
        existingProfile.email = employee.email;
        existingProfile.phone = employee.phone;
        existingProfile.department = employee.department;
        existingProfile.position = employee.position;
        existingProfile.lastUpdated = new Date();
        
        await existingProfile.save();
        console.log('Employee profile updated');
        
        // Sync attendance data
        await syncAttendanceData(employee._id, employee.employeeId, EmployeeAttendance);
      } else {
        console.log('Creating new employee profile...');
        
        // Create new profile
        const newProfile = new EmployeeProfile({
          mainEmployeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          lastUpdated: new Date()
        });
        
        await newProfile.save();
        console.log('New employee profile created');
        
        // Create some sample data for testing
        
        // 1. Create a schedule for current week
        console.log('Creating sample schedule...');
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Get last Sunday
        weekStart.setHours(0, 0, 0, 0);
        
        const newSchedule = new Schedule({
          employeeId: employee.employeeId,
          weekStartDate: weekStart,
          shifts: [
            {
              day: 'monday',
              startTime: '08:00',
              endTime: '17:00',
              breakTime: 60,
              isOffDay: false,
              notes: 'Regular shift'
            },
            {
              day: 'tuesday',
              startTime: '08:00',
              endTime: '17:00',
              breakTime: 60,
              isOffDay: false
            },
            {
              day: 'wednesday',
              startTime: '08:00',
              endTime: '17:00',
              breakTime: 60,
              isOffDay: false
            },
            {
              day: 'thursday',
              startTime: '08:00',
              endTime: '17:00',
              breakTime: 60,
              isOffDay: false
            },
            {
              day: 'friday',
              startTime: '08:00',
              endTime: '17:00',
              breakTime: 60,
              isOffDay: false
            },
            {
              day: 'saturday',
              isOffDay: true
            },
            {
              day: 'sunday',
              isOffDay: true
            }
          ],
          status: 'published',
          createdBy: 'system'
        });
        
        await newSchedule.save();
        console.log('Sample schedule created');
        
        // 2. Create a sample payroll record
        console.log('Creating sample payroll...');
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const payPeriodStart = new Date(currentYear, currentMonth, 1);
        const payPeriodEnd = new Date(currentYear, currentMonth + 1, 0);
        
        const salary = employee.salary || 3000; // Default if not set
        const hourlyRate = salary / 160; // Assuming 160 working hours per month
        
        const regularHours = 160;
        const regularPay = Math.round(hourlyRate * regularHours * 100) / 100;
        const overtimeHours = Math.floor(Math.random() * 20); // Random OT between 0-20 hours
        const overtimePay = Math.round(hourlyRate * 1.5 * overtimeHours * 100) / 100;
        
        const federalTax = Math.round(regularPay * 0.12 * 100) / 100;
        const stateTax = Math.round(regularPay * 0.05 * 100) / 100;
        const ficaTax = Math.round(regularPay * 0.062 * 100) / 100;
        const medicareTax = Math.round(regularPay * 0.0145 * 100) / 100;
        
        const newPayroll = new Payroll({
          employeeId: employee.employeeId,
          payPeriod: {
            startDate: payPeriodStart,
            endDate: payPeriodEnd
          },
          earnings: {
            regularHours,
            regularPay,
            overtimeHours,
            overtimePay,
            grossPay: regularPay + overtimePay
          },
          deductions: {
            taxes: {
              federal: federalTax,
              state: stateTax,
              fica: ficaTax,
              medicare: medicareTax
            },
            totalDeductions: federalTax + stateTax + ficaTax + medicareTax
          },
          netPay: regularPay + overtimePay - (federalTax + stateTax + ficaTax + medicareTax),
          paymentDetails: {
            paymentMethod: 'direct_deposit',
            paymentDate: payPeriodEnd,
            status: 'completed'
          },
          approvedBy: 'system',
          status: 'paid'
        });
        
        await newPayroll.save();
        console.log('Sample payroll created');
        
        // 3. Create sample attendance records
        console.log('Creating sample attendance records...');
        await createSampleAttendance(employee._id, employee.employeeId, EmployeeAttendance);
      }
      
      console.log(`Completed processing employee: ${employee.firstName} ${employee.lastName}\n`);
    }
    
    console.log('Employee data sync completed');
    process.exit(0);
  } catch (error: any) {
    console.error('Error syncing employee data:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

/**
 * Helper function to synchronize attendance data from main DB to employee DB
 */
const syncAttendanceData = async (employeeObjectId: string, employeeId: string, EmployeeAttendance: any) => {
  try {
    console.log(`Syncing attendance data for employee: ${employeeId}`);
    
    // Get attendance records from main DB
    const attendanceRecords = await Attendance.find({ employee: employeeObjectId })
      .sort({ date: -1 })
      .limit(90); // Get last 90 days of records
    
    console.log(`Found ${attendanceRecords.length} attendance records in main database`);
    
    if (attendanceRecords.length === 0) {
      // Create sample attendance data if none exists
      await createSampleAttendance(employeeObjectId, employeeId, EmployeeAttendance);
      return;
    }
    
    // Process each record
    for (const record of attendanceRecords) {
      // Check if record already exists in employee DB
      const existingRecord = await EmployeeAttendance.findOne({
        employeeId,
        date: record.date
      });
      
      if (existingRecord) {
        // Update existing record with latest data
        existingRecord.clockInTime = record.clockInTime ? formatTimeToHHMM(record.clockInTime) : undefined;
        existingRecord.clockOutTime = record.clockOutTime ? formatTimeToHHMM(record.clockOutTime) : undefined;
        existingRecord.status = record.status;
        existingRecord.totalHours = record.totalHours;
        existingRecord.notes = record.notes;
        existingRecord.leaveType = record.leaveType;
        existingRecord.leaveReason = record.leaveReason;
        
        await existingRecord.save();
      } else {
        // Create new record in employee DB
        const newRecord = new EmployeeAttendance({
          employeeId,
          date: record.date,
          clockInTime: record.clockInTime ? formatTimeToHHMM(record.clockInTime) : undefined,
          clockOutTime: record.clockOutTime ? formatTimeToHHMM(record.clockOutTime) : undefined,
          status: record.status,
          totalHours: record.totalHours,
          location: record.location,
          notes: record.notes,
          leaveType: record.leaveType,
          leaveReason: record.leaveReason,
          selfReported: false,
          isApproved: true
        });
        
        // Add employee-specific metrics
        calculateAttendanceMetrics(newRecord, attendanceRecords);
        
        await newRecord.save();
      }
    }
    
    // Calculate and update monthly summaries
    await updateMonthlySummaries(employeeId, EmployeeAttendance);
    
    console.log(`Attendance data sync completed for employee: ${employeeId}`);
  } catch (error: any) {
    console.error(`Error syncing attendance data for employee ${employeeId}:`, error.message);
  }
};

/**
 * Helper function to create sample attendance records for a new employee
 */
const createSampleAttendance = async (employeeObjectId: string, employeeId: string, EmployeeAttendance: any) => {
  try {
    console.log(`Creating sample attendance records for employee: ${employeeId}`);
    
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30); // Create 30 days of attendance
    
    const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const statuses = ['present', 'present', 'present', 'present', 'late', 'late', 'absent'];
    
    const records = [];
    
    // Create records for the past 30 days
    for (let i = 0; i < 30; i++) {
      const recordDate = new Date(startDate);
      recordDate.setDate(startDate.getDate() + i);
      
      // Skip weekends
      const dayOfWeek = recordDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (!workingDays.includes(dayOfWeek)) {
        continue;
      }
      
      // Randomly select a status with weighted probability
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const status = statuses[statusIndex];
      
      // Create clockIn and clockOut times based on status
      let clockInTime, clockOutTime;
      
      if (status === 'present') {
        // Regular working hours (8:00 - 17:00)
        clockInTime = '08:00';
        clockOutTime = '17:00';
      } else if (status === 'late') {
        // Late arrival (8:15 - 17:00)
        const minutes = Math.floor(Math.random() * 45) + 15; // 15-60 minutes late
        clockInTime = `08:${minutes.toString().padStart(2, '0')}`;
        clockOutTime = '17:00';
      } else if (status === 'absent') {
        clockInTime = null;
        clockOutTime = null;
      }
      
      // Don't create records for future dates
      if (recordDate > today) {
        continue;
      }
      
      // Calculate total hours if both clock times exist
      let totalHours = null;
      if (clockInTime && clockOutTime) {
        const [inHour, inMin] = clockInTime.split(':').map(Number);
        const [outHour, outMin] = clockOutTime.split(':').map(Number);
        
        // Calculate hours, accounting for lunch break
        totalHours = (outHour - inHour) - 1; // Assuming 1 hour lunch break
        
        // Adjust for minutes
        const minuteDiff = outMin - inMin;
        if (minuteDiff < 0) {
          totalHours -= 1;
          totalHours += (60 + minuteDiff) / 60;
        } else {
          totalHours += minuteDiff / 60;
        }
      }
      
      // Create the record
      const record = new EmployeeAttendance({
        employeeId,
        date: recordDate,
        clockInTime,
        clockOutTime,
        status,
        totalHours,
        selfReported: false,
        isApproved: true,
        metrics: {
          punctuality: status === 'present' ? 5 : (status === 'late' ? 3 : 1),
          consistency: Math.floor(Math.random() * 5) + 1, // Random 1-5
          consecutiveDays: 0 // Will be calculated later
        }
      });
      
      records.push(record);
    }
    
    // Calculate consecutive days and save records
    let consecutiveDays = 0;
    for (let i = records.length - 1; i >= 0; i--) {
      const record = records[i];
      
      if (record.status === 'present' || record.status === 'late') {
        consecutiveDays++;
      } else {
        consecutiveDays = 0;
      }
      
      record.metrics.consecutiveDays = consecutiveDays;
      await record.save();
    }
    
    // Update monthly summaries
    await updateMonthlySummaries(employeeId, EmployeeAttendance);
    
    console.log(`Created ${records.length} sample attendance records for employee: ${employeeId}`);
  } catch (error: any) {
    console.error(`Error creating sample attendance for employee ${employeeId}:`, error.message);
  }
};

/**
 * Helper function to calculate attendance metrics for an employee
 */
const calculateAttendanceMetrics = (record: any, allRecords: any[]) => {
  try {
    // Calculate punctuality score (1-5)
    if (record.status === 'present') {
      record.metrics = {
        ...record.metrics,
        punctuality: 5
      };
    } else if (record.status === 'late') {
      // Calculate how late (in minutes)
      if (record.clockInTime) {
        const [hour, minute] = record.clockInTime.split(':').map(Number);
        let minutesLate = 0;
        
        if (hour > 8) {
          minutesLate = (hour - 8) * 60 + minute;
        } else if (hour === 8) {
          minutesLate = minute;
        }
        
        // Score based on how late
        if (minutesLate <= 15) {
          record.metrics = { ...record.metrics, punctuality: 4 };
        } else if (minutesLate <= 30) {
          record.metrics = { ...record.metrics, punctuality: 3 };
        } else if (minutesLate <= 60) {
          record.metrics = { ...record.metrics, punctuality: 2 };
        } else {
          record.metrics = { ...record.metrics, punctuality: 1 };
        }
      } else {
        record.metrics = { ...record.metrics, punctuality: 3 }; // Default if no time recorded
      }
    } else {
      record.metrics = { ...record.metrics, punctuality: 1 }; // Absent gets lowest score
    }
    
    // Calculate consistency score based on percentage of days present in the last 30 days
    const thirtyDaysAgo = new Date(record.date);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = allRecords.filter(r => 
      new Date(r.date) >= thirtyDaysAgo && new Date(r.date) <= new Date(record.date)
    );
    
    const presentCount = recentRecords.filter(r => 
      r.status === 'present' || r.status === 'late'
    ).length;
    
    const consistencyPercentage = recentRecords.length > 0 
      ? (presentCount / recentRecords.length) * 100 
      : 100;
    
    // Score based on percentage
    let consistencyScore = 3; // Default
    if (consistencyPercentage >= 95) {
      consistencyScore = 5;
    } else if (consistencyPercentage >= 90) {
      consistencyScore = 4;
    } else if (consistencyPercentage >= 80) {
      consistencyScore = 3;
    } else if (consistencyPercentage >= 70) {
      consistencyScore = 2;
    } else {
      consistencyScore = 1;
    }
    
    record.metrics = { ...record.metrics, consistency: consistencyScore };
    
    // Calculate consecutive days
    let consecutiveDays = 0;
    const recordDate = new Date(record.date);
    
    // Sort records by date descending
    const sortedRecords = [...allRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const r of sortedRecords) {
      if (new Date(r.date) >= recordDate) {
        continue; // Skip records on or after the current date
      }
      
      // Check if the record is for the previous day
      const previousDay = new Date(recordDate);
      previousDay.setDate(recordDate.getDate() - consecutiveDays - 1);
      
      const recordDay = new Date(r.date);
      
      // Dates should be one day apart and status should be present or late
      if (previousDay.toDateString() === recordDay.toDateString() && 
          (r.status === 'present' || r.status === 'late')) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    record.metrics = { ...record.metrics, consecutiveDays };
    
  } catch (error: any) {
    console.error('Error calculating attendance metrics:', error.message);
  }
};

/**
 * Helper function to update monthly attendance summaries
 */
const updateMonthlySummaries = async (employeeId: string, EmployeeAttendance: any) => {
  try {
    console.log(`Updating monthly summaries for employee: ${employeeId}`);
    
    // Get all attendance records
    const allRecords = await EmployeeAttendance.find({ employeeId }).sort({ date: 1 });
    
    // Group records by month and year
    const monthlyRecords: Record<string, any[]> = {};
    
    allRecords.forEach((record: any) => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12 for January-December
      
      const key = `${year}-${month}`;
      if (!monthlyRecords[key]) {
        monthlyRecords[key] = [];
      }
      
      monthlyRecords[key].push(record);
    });
    
    // Calculate and update monthly summaries
    for (const [key, records] of Object.entries(monthlyRecords)) {
      const [year, month] = key.split('-').map(Number);
      
      // Calculate summary metrics
      const presentDays = records.filter(r => r.status === 'present').length;
      const absentDays = records.filter(r => r.status === 'absent').length;
      const lateDays = records.filter(r => r.status === 'late').length;
      const leavesTaken = records.filter(r => r.status === 'leave').length;
      
      // Calculate total hours
      let totalHours = 0;
      records.forEach(r => {
        if (r.totalHours) {
          totalHours += r.totalHours;
        }
      });
      
      // Save monthly summary to each record
      for (const record of records) {
        record.monthSummary = {
          month,
          year,
          presentDays,
          absentDays,
          lateDays,
          leavesTaken,
          totalHours: Math.round(totalHours * 100) / 100
        };
        
        await record.save();
      }
    }
    
    console.log(`Monthly summaries updated for employee: ${employeeId}`);
  } catch (error: any) {
    console.error(`Error updating monthly summaries for employee ${employeeId}:`, error.message);
  }
};

/**
 * Helper function to format time values to HH:MM string format
 */
const formatTimeToHHMM = (time: any): string => {
  // Handle if time is already in HH:MM format
  if (typeof time === 'string' && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return time;
  }
  
  try {
    // Handle Date objects
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Format to HH:MM
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '00:00'; // Default fallback
  }
};

// Execute the sync
syncAllEmployeeData(); 