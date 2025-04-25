// Nhập thư viện Express và ShippingController
const express = require('express');
const router = express.Router();
const { updateShipping, getShippingStatus } = require('../controllers/shippingController');

// Định nghĩa các route
router.post('/update', updateShipping);
router.get('/status/:orderId', getShippingStatus);

// Xuất router
module.exports = router;