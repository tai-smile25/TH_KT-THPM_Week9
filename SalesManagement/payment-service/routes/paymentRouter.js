// Nhập thư viện Express và PaymentController
const express = require('express');
const router = express.Router();
const { processPayment, refundPayment, getPaymentStatus } = require('../controllers/paymentController');

// Định nghĩa các route
router.post('/process', processPayment);
router.post('/refund/:orderId', refundPayment);
router.get('/status/:orderId', getPaymentStatus);

// Xuất router
module.exports = router;