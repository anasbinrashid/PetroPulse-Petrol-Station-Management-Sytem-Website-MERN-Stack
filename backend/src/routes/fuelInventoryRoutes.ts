import express from 'express';
import {
  getFuelInventory,
  getFuelInventoryById,
  createFuelInventory,
  updateFuelInventory,
  deleteFuelInventory,
  updateFuelLevel,
} from '../controllers/fuelInventoryController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getFuelInventory).post(protect, admin, createFuelInventory);
router
  .route('/:id')
  .get(getFuelInventoryById)
  .put(protect, admin, updateFuelInventory)
  .delete(protect, admin, deleteFuelInventory);
router.route('/:id/level').patch(protect, admin, updateFuelLevel);

export default router;
