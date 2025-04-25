const axios = require("axios");
const Order = require("../model/orderSchema");

exports.createOrder = async (req, res) => {
  const { customerId, products } = req.body;

  try {
    for (const item of products) {
      const response = await axios.get(`http://localhost:3001/api/products/${item.productId}`);
      if (!response.data) {
        return res.status(400).json({ error: `Product với ID ${item.productId} không tồn tại.` });
      }
    }

    const order = await Order.create({ customerId, products });
    res.status(201).json(order);
  } catch (err) {
    console.error("Lỗi kiểm tra sản phẩm:", err.message);
    res.status(500).json({ error: "Không thể xác minh productId từ Product Service." });
  }
};
