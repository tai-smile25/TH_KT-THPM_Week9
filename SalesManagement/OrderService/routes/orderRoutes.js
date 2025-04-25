const express = require('express');
const router = express.Router(); 
const orderController = require ('../controller/orderController');

router.post('/createOrder', orderController.createOrder);

module.exports = router;