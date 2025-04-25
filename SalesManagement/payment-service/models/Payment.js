const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);