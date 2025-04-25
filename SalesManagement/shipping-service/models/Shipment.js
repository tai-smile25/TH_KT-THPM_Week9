const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['PENDING', 'SHIPPED', 'DELIVERED'], default: 'PENDING' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shipment', shipmentSchema);