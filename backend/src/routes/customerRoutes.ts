
import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, admin, getCustomers).post(protect, admin, createCustomer);
router
  .route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, admin, deleteCustomer);

export default router;
