const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);