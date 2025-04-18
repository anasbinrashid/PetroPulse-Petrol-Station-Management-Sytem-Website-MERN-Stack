import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateStock 
} from '../controllers/productController';

const router = express.Router();

// Public routes
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// Protected routes (admin only)
router.route('/').post(protect, admin, createProduct);
router.route('/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.route('/:id/stock').patch(protect, admin, updateStock);

export default router;
