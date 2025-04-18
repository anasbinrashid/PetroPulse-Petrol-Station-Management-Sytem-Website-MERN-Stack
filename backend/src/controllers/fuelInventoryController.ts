import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import FuelInventory from '../models/fuelInventoryModel';

// @desc    Fetch all fuel inventory
// @route   GET /api/fuel-inventory
// @access  Private/Admin
export const getFuelInventory = asyncHandler(async (req: Request, res: Response) => {
  const fuelInventory = await FuelInventory.find({});
  res.json(fuelInventory);
});

// @desc    Fetch single fuel inventory item
// @route   GET /api/fuel-inventory/:id
// @access  Private/Admin
export const getFuelInventoryById = asyncHandler(async (req: Request, res: Response) => {
  const fuelInventory = await FuelInventory.findById(req.params.id);

  if (fuelInventory) {
    res.json(fuelInventory);
  } else {
    res.status(404);
    throw new Error('Fuel inventory not found');
  }
});

// @desc    Create a fuel inventory item
// @route   POST /api/fuel-inventory
// @access  Private/Admin
export const createFuelInventory = asyncHandler(async (req: Request, res: Response) => {
  const { fuelType, currentLevel, capacity, pricePerGallon, supplier, minimumLevel, tankNumber } = req.body;

  const fuelInventory = await FuelInventory.create({
    fuelType,
    currentLevel,
    capacity,
    pricePerGallon,
    supplier,
    minimumLevel,
    tankNumber,
    lastDelivery: new Date(),
    lastUpdated: new Date(),
  });

  if (fuelInventory) {
    res.status(201).json(fuelInventory);
  } else {
    res.status(400);
    throw new Error('Invalid fuel inventory data');
  }
});

// @desc    Update a fuel inventory item
// @route   PUT /api/fuel-inventory/:id
// @access  Private/Admin
export const updateFuelInventory = asyncHandler(async (req: Request, res: Response) => {
  const {
    fuelType,
    currentLevel,
    capacity,
    pricePerGallon,
    supplier,
    minimumLevel,
    tankNumber,
  } = req.body;

  const fuelInventory = await FuelInventory.findById(req.params.id);

  if (fuelInventory) {
    fuelInventory.fuelType = fuelType || fuelInventory.fuelType;
    fuelInventory.currentLevel = currentLevel !== undefined ? currentLevel : fuelInventory.currentLevel;
    fuelInventory.capacity = capacity || fuelInventory.capacity;
    fuelInventory.pricePerGallon = pricePerGallon || fuelInventory.pricePerGallon;
    fuelInventory.supplier = supplier || fuelInventory.supplier;
    fuelInventory.minimumLevel = minimumLevel || fuelInventory.minimumLevel;
    fuelInventory.tankNumber = tankNumber || fuelInventory.tankNumber;
    fuelInventory.lastUpdated = new Date();

    const updatedFuelInventory = await fuelInventory.save();
    res.json(updatedFuelInventory);
  } else {
    res.status(404);
    throw new Error('Fuel inventory not found');
  }
});

// @desc    Delete a fuel inventory item
// @route   DELETE /api/fuel-inventory/:id
// @access  Private/Admin
export const deleteFuelInventory = asyncHandler(async (req: Request, res: Response) => {
  const fuelInventory = await FuelInventory.findById(req.params.id);

  if (fuelInventory) {
    await fuelInventory.deleteOne();
    res.json({ message: 'Fuel inventory removed' });
  } else {
    res.status(404);
    throw new Error('Fuel inventory not found');
  }
});

// @desc    Update fuel level
// @route   PATCH /api/fuel-inventory/:id/level
// @access  Private/Admin
export const updateFuelLevel = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Updating fuel level for ID: ${req.params.id}`);
    
    const { amount, operation } = req.body;
    
    if (!amount || !operation) {
      res.status(400).json({ message: 'Amount and operation are required' });
      return;
    }
    
    const fuelInventory = await FuelInventory.findById(req.params.id);
    
    if (fuelInventory) {
      // Calculate new level based on operation
      let newLevel = fuelInventory.currentLevel;
      
      if (operation === 'add') {
        newLevel += Number(amount);
        if (newLevel > fuelInventory.capacity) {
          res.status(400).json({ 
            message: 'Cannot exceed tank capacity', 
            currentLevel: fuelInventory.currentLevel,
            capacity: fuelInventory.capacity 
          });
          return;
        }
      } else if (operation === 'subtract') {
        newLevel -= Number(amount);
        if (newLevel < 0) newLevel = 0;
      } else if (operation === 'set') {
        if (Number(amount) > fuelInventory.capacity) {
          res.status(400).json({ 
            message: 'Cannot exceed tank capacity', 
            currentLevel: fuelInventory.currentLevel,
            capacity: fuelInventory.capacity 
          });
          return;
        }
        newLevel = Number(amount);
      }
      
      // Update the fuel inventory
      fuelInventory.currentLevel = newLevel;
      fuelInventory.lastUpdated = new Date();
      
      const updatedFuelInventory = await fuelInventory.save();
      
      console.log(`Fuel level updated for ${fuelInventory.fuelType}. New level: ${updatedFuelInventory.currentLevel}`);
      res.json(updatedFuelInventory);
    } else {
      console.log('Fuel inventory not found');
      res.status(404).json({ message: 'Fuel inventory not found' });
    }
  } catch (error) {
    console.error('Error updating fuel level:', error);
    res.status(500).json({ message: 'Error updating fuel level', error: (error as Error).message });
  }
});
