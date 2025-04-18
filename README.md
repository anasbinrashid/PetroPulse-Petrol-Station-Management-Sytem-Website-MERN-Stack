
# PetroPulse - Gas Station Management System

PetroPulse is a comprehensive management system for gas stations, providing features for inventory management, sales tracking, employee management, and customer loyalty programs.

## Features

- **Multi-user authentication** (Admin, Employee, Customer)
- **Inventory management** for fuel and store products
- **Sales tracking and reporting**
- **Employee management** with attendance tracking
- **Customer loyalty program**
- **Financial reporting and analytics**
- **Responsive design** for all devices

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- MongoDB (local installation or Atlas account)
- npm or yarn package manager

### Installation

#### Frontend

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

#### Backend

1. Navigate to the backend directory

```bash
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=petropulse_secret_key_change_in_production
NODE_ENV=development
```

4. Seed the database with initial data

```bash
npm run seed
```

5. Start the backend server

```bash
npm run dev
```

### Login Credentials

After seeding the database, you can use the following credentials to log in:

- **Admin:**
  - Email: admin@petropulse.com
  - Password: admin123

- **Employee:**
  - Email: employee@petropulse.com
  - Password: employee123

- **Customer:**
  - Email: customer@example.com
  - Password: customer123

## Project Structure

### Frontend

- `/src/components` - Reusable UI components
- `/src/pages` - Page components for different routes
- `/src/services` - API service layer
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions

### Backend

- `/src/config` - Configuration files
- `/src/controllers` - API route controllers
- `/src/middleware` - Express middleware
- `/src/models` - MongoDB schema models
- `/src/routes` - API route definitions
- `/src/utils` - Utility functions

## Technologies Used

### Frontend

- React
- TypeScript
- React Router
- React Query
- Tailwind CSS
- Recharts for data visualization
- Shadcn UI components

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT) for authentication

## License

This project is licensed under the MIT License.
