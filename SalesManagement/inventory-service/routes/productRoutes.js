// Nhập thư viện Express và ProductInventoryController
const express = require('express');
const router = express.Router();
const { createProduct, getProduct, updateInventory, getInventoryStatus } = require('../controllers/productController');

// Định nghĩa các route
router.post('/create', createProduct);
router.get('/:productId', getProduct);
router.post('/inventory/update', updateInventory);
router.get('/inventory/status/:productId', getInventoryStatus);

// Xuất router
module.exports = router;