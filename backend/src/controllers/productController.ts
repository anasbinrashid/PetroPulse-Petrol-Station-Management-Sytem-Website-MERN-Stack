import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ProductModel from '../models/admin/ProductModel';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private/Admin
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Fetching all products...');
    
    // Parse query parameters for filtering
    const category = req.query.category as string | undefined;
    const searchQuery = req.query.search as string | undefined;
    
    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { supplier: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    const products = await ProductModel.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: (error as Error).message });
  }
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Private/Admin
 */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Fetching product with ID: ${req.params.id}`);
    
    const product = await ProductModel.findById(req.params.id);
    
    if (product) {
      console.log(`Product found: ${product.name}`);
      res.json(product);
    } else {
      console.log('Product not found');
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: (error as Error).message });
  }
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Creating new product:', req.body);
    
    const {
      name,
      sku,
      category,
      description,
      price,
      cost,
      quantity,
      supplier,
      images,
      barcode,
      reorderLevel,
      location,
      isActive,
      tags,
      specifications,
      discountPercentage
    } = req.body;
    
    // Generate a SKU if not provided
    const generatedSku = sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const product = await ProductModel.create({
      name,
      sku: generatedSku,
      category,
      description,
      price,
      cost,
      quantity,
      supplier,
      images: images || [],
      barcode,
      reorderLevel,
      location: location || 'Main Store',
      isActive: isActive !== undefined ? isActive : true,
      tags: tags || [],
      specifications: specifications || {},
      discountPercentage: discountPercentage || 0
    });
    
    console.log(`Product created with ID: ${product._id}`);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: (error as Error).message });
  }
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Updating product with ID: ${req.params.id}`);
    
    const product = await ProductModel.findById(req.params.id);
    
    if (product) {
      // Update product fields
      Object.keys(req.body).forEach(key => {
        // Skip updating SKU if it already exists (to avoid unique constraint issues)
        if (key === 'sku' && req.body.sku === product.sku) return;
        
        // @ts-ignore - Dynamic field assignment
        product[key] = req.body[key];
      });
      
      const updatedProduct = await product.save();
      console.log(`Product updated: ${updatedProduct.name}`);
      res.json(updatedProduct);
    } else {
      console.log('Product not found');
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: (error as Error).message });
  }
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Deleting product with ID: ${req.params.id}`);
    
    const product = await ProductModel.findById(req.params.id);
    
    if (product) {
      await product.deleteOne();
      console.log(`Product deleted: ${product.name}`);
      res.json({ message: 'Product removed' });
    } else {
      console.log('Product not found');
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: (error as Error).message });
  }
});

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private/Admin
 */
export const updateStock = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Updating stock for product ID: ${req.params.id}`);
    
    const { quantity, operation } = req.body;
    
    if (!quantity || !operation) {
      res.status(400).json({ message: 'Quantity and operation are required' });
      return;
    }
    
    const product = await ProductModel.findById(req.params.id);
    
    if (product) {
      // Calculate new quantity based on operation
      let newQuantity = product.quantity;
      
      if (operation === 'add') {
        newQuantity += Number(quantity);
      } else if (operation === 'subtract') {
        newQuantity -= Number(quantity);
        if (newQuantity < 0) newQuantity = 0;
      } else if (operation === 'set') {
        newQuantity = Number(quantity);
      }
      
      // Update the product
      product.quantity = newQuantity;
      const updatedProduct = await product.save();
      
      console.log(`Stock updated for ${product.name}. New quantity: ${updatedProduct.quantity}`);
      res.json(updatedProduct);
    } else {
      console.log('Product not found');
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock', error: (error as Error).message });
  }
}); 