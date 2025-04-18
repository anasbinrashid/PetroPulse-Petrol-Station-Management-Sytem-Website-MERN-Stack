
# PetroPulse Backend Setup - MongoDB & Express

This document provides instructions for setting up the backend for PetroPulse, which uses MongoDB as the database and Express.js as the API framework.

## Prerequisites

1. Node.js (v14.x or later)
2. MongoDB (local installation or Atlas account)
3. npm or yarn package manager

## Setup Instructions

### 1. Create a new folder for your backend

```bash
mkdir petropulse-backend
cd petropulse-backend
```

### 2. Initialize a new Node.js project

```bash
npm init -y
```

### 3. Install dependencies

```bash
npm install express mongoose cors dotenv helmet morgan body-parser
npm install -D nodemon typescript ts-node @types/express @types/node @types/cors
```

### 4. Create a TypeScript configuration

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 5. Set up your project structure

Create the following folder structure:

```
petropulse-backend/
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   │   ├── fuelInventory.controller.ts
│   │   ├── products.controller.ts
│   │   ├── revenue.controller.ts
│   │   └── sales.controller.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/
│   │   ├── FuelInventory.model.ts
│   │   ├── Product.model.ts
│   │   ├── Revenue.model.ts
│   │   └── Sale.model.ts
│   ├── routes/
│   │   ├── fuelInventory.routes.ts
│   │   ├── products.routes.ts
│   │   ├── revenue.routes.ts
│   │   └── sales.routes.ts
│   └── app.ts
├── .env
├── package.json
└── tsconfig.json
```

### 6. Create your .env file

Create a `.env` file in the root directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/petropulse
NODE_ENV=development
```

### 7. Set up the database connection

Create `src/config/db.ts`:

```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petropulse');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

### 8. Create your models

For example, create `src/models/FuelInventory.model.ts`:

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IFuelInventory extends Document {
  fuelType: string;
  currentLevel: number;
  capacity: number;
  pricePerGallon: number;
  lastUpdated: Date;
}

const FuelInventorySchema: Schema = new Schema(
  {
    fuelType: { type: String, required: true },
    currentLevel: { type: Number, required: true },
    capacity: { type: Number, required: true },
    pricePerGallon: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IFuelInventory>('FuelInventory', FuelInventorySchema);
```

Create similar models for Revenue, Products, and Sales.

### 9. Create route handlers

For example, create `src/routes/fuelInventory.routes.ts`:

```typescript
import { Router } from 'express';
import * as FuelInventoryController from '../controllers/fuelInventory.controller';

const router = Router();

router.get('/', FuelInventoryController.getAllFuelInventory);
router.get('/:id', FuelInventoryController.getFuelInventoryById);
router.post('/', FuelInventoryController.createFuelInventory);
router.put('/:id', FuelInventoryController.updateFuelInventory);
router.delete('/:id', FuelInventoryController.deleteFuelInventory);

export default router;
```

Create similar routes for other resources.

### 10. Create controllers

For example, create `src/controllers/fuelInventory.controller.ts`:

```typescript
import { Request, Response } from 'express';
import FuelInventory from '../models/FuelInventory.model';

export const getAllFuelInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const fuelInventories = await FuelInventory.find();
    res.status(200).json(fuelInventories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFuelInventoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const fuelInventory = await FuelInventory.findById(req.params.id);
    if (!fuelInventory) {
      res.status(404).json({ message: 'Fuel inventory not found' });
      return;
    }
    res.status(200).json(fuelInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFuelInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const newFuelInventory = new FuelInventory(req.body);
    const savedFuelInventory = await newFuelInventory.save();
    res.status(201).json(savedFuelInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateFuelInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedFuelInventory = await FuelInventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedFuelInventory) {
      res.status(404).json({ message: 'Fuel inventory not found' });
      return;
    }
    res.status(200).json(updatedFuelInventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFuelInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedFuelInventory = await FuelInventory.findByIdAndDelete(req.params.id);
    if (!deletedFuelInventory) {
      res.status(404).json({ message: 'Fuel inventory not found' });
      return;
    }
    res.status(200).json({ message: 'Fuel inventory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

Create similar controllers for other resources.

### 11. Set up the main app file

Create `src/app.ts`:

```typescript
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';

// Import routes
import fuelInventoryRoutes from './routes/fuelInventory.routes';
import productsRoutes from './routes/products.routes';
import revenueRoutes from './routes/revenue.routes';
import salesRoutes from './routes/sales.routes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/fuel-inventory', fuelInventoryRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/sales', salesRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('PetroPulse API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
```

### 12. Update package.json scripts

Add these scripts to your package.json:

```json
"scripts": {
  "start": "node dist/app.js",
  "dev": "nodemon src/app.ts",
  "build": "tsc -p ."
}
```

### 13. Run your backend

```bash
npm run dev
```

Your Express API will now be running on port 5000 and connected to MongoDB.

## Connecting to Frontend

In your React frontend, make sure the API_BASE_URL in src/services/api.ts points to your backend:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Next Steps

1. Implement authentication with JWT or Passport.js
2. Add validation for incoming requests
3. Create more complex endpoints for reports and analytics
4. Set up error logging
5. Add testing with Jest
