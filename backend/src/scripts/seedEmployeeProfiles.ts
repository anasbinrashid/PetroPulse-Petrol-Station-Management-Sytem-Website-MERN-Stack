import mongoose from 'mongoose';
import dotenv from 'dotenv';
import employeeDbConnection from '../config/employeeDb';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config();

// Shifts for employees
const shifts = ['morning', 'afternoon', 'evening', 'night', 'flexible'];

// Status options for employees
const statuses = ['active', 'on_leave', 'inactive'];

// Define a type for department keys
type Department = 'management' | 'cashier' | 'maintenance' | 'fuel' | 'other';

// Roles based on departments
const departmentRoles: Record<Department, string[]> = {
  'management': ['Manager', 'Assistant Manager', 'Supervisor', 'Team Lead'],
  'cashier': ['Senior Cashier', 'Cashier', 'Trainee Cashier'],
  'maintenance': ['Maintenance Supervisor', 'Maintenance Technician', 'Janitor'],
  'fuel': ['Fuel Attendant Supervisor', 'Senior Fuel Attendant', 'Fuel Attendant'],
  'other': ['Administrative Assistant', 'Security Guard', 'Customer Service Representative']
};

// Get a random item from an array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate a random date within the last 5 years
const getRandomStartDate = () => {
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  const timeDiff = now.getTime() - fiveYearsAgo.getTime();
  const randomTime = Math.random() * timeDiff;
  return new Date(fiveYearsAgo.getTime() + randomTime);
};

// Seed employee profiles with additional fields
const seedEmployeeProfiles = async () => {
  try {
    console.log('Connecting to employee database...');
    const connection = await employeeDbConnection;
    console.log('Connected to employee database');

    // Get the EmployeeProfile model
    const EmployeeProfile = connection.model('EmployeeProfile');
    
    // Get all employee profiles
    const profiles = await EmployeeProfile.find({});
    console.log(`Found ${profiles.length} employee profiles to update`);

    for (const profile of profiles) {
      // Get department or default to 'other'
      const department = (profile.department as Department) || 'other';
      
      // Get roles for this department (ensure it's a valid department key or use 'other')
      const validDepartment = Object.keys(departmentRoles).includes(department) 
        ? department as Department 
        : 'other';
      
      // Set role if not already set (based on department)
      if (!profile.role) {
        profile.role = getRandomItem(departmentRoles[validDepartment]);
      }
      
      // Set status if not already set
      if (!profile.status) {
        profile.status = getRandomItem(statuses);
      }
      
      // Set startDate if not already set
      if (!profile.startDate) {
        profile.startDate = getRandomStartDate();
      }
      
      // Set shift if not already set
      if (!profile.shift) {
        profile.shift = getRandomItem(shifts);
      }
      
      // Save the updated profile
      await profile.save();
      console.log(`Updated profile for ${profile.firstName} ${profile.lastName}`);
    }

    console.log(`Successfully updated ${profiles.length} employee profiles`);
    
    // Create some new profiles if none exist
    if (profiles.length === 0) {
      console.log('No existing profiles found. Creating sample employee profiles...');
      
      const sampleEmployees = [
        {
          mainEmployeeId: randomUUID(),
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@petropulse.com',
          phone: '555-123-4567',
          department: 'management',
          position: 'Manager',
          role: 'Station Manager',
          status: 'active',
          startDate: new Date(2019, 3, 15),
          shift: 'morning'
        },
        {
          mainEmployeeId: randomUUID(),
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@petropulse.com',
          phone: '555-987-6543',
          department: 'cashier',
          position: 'Cashier',
          role: 'Senior Cashier',
          status: 'active',
          startDate: new Date(2020, 6, 22),
          shift: 'afternoon'
        },
        {
          mainEmployeeId: randomUUID(),
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert.johnson@petropulse.com',
          phone: '555-456-7890',
          department: 'maintenance',
          position: 'Technician',
          role: 'Maintenance Technician',
          status: 'active',
          startDate: new Date(2021, 2, 10),
          shift: 'evening'
        },
        {
          mainEmployeeId: randomUUID(),
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah.williams@petropulse.com',
          phone: '555-789-0123',
          department: 'fuel',
          position: 'Attendant',
          role: 'Fuel Attendant',
          status: 'on_leave',
          startDate: new Date(2022, 9, 5),
          shift: 'flexible'
        }
      ];

      await EmployeeProfile.insertMany(sampleEmployees);
      console.log(`Created ${sampleEmployees.length} sample employee profiles`);
    }

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Execute the seeding
seedEmployeeProfiles(); 