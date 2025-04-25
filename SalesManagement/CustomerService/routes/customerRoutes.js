const express = require('express');
const router = express.Router();
const customerController = require ('../controller/customerController');

router.post('/createCustomer', customerController.createCustomer);
router.get('/getAllCustomers', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
