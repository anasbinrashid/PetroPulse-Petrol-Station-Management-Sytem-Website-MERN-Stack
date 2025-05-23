import express from 'express';
import {
  getSales,
  getTransactionById,
  createTransaction,
  getFuelPurchasesByCustomer,
  getSalesReport
} from '../controllers/salesController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getSales).post(protect, createTransaction);
router.route('/report').get(protect, admin, getSalesReport);
router.route('/:id').get(protect, getTransactionById);
router.route('/fuel-purchases/:customerId').get(protect, getFuelPurchasesByCustomer);

export default router;
