const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

router.post('/createProduct', productController.createProduct);
router.get('/getAllProducts', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
