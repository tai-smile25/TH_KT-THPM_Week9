const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Product = require('./models/Product'); // Đường dẫn đến model Product

// Load environment variables
dotenv.config();

// MongoDB connection URL
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-service';

// Dữ liệu mẫu cho sản phẩm, tương thích với schema
const sampleProducts = [
  { productId: 'PROD001', name: 'Adidas Ultra Boost', price: 100.0, description: 'High-performance running shoes', quantity: 50 },
  { productId: 'PROD002', name: 'Nike Air Max', price: 120.0, description: 'Comfortable casual sneakers', quantity: 30 },
  { productId: 'PROD003', name: 'Puma Running Shoes', price: 80.0, description: 'Lightweight running shoes', quantity: 40 },
  { productId: 'PROD004', name: 'Reebok Classic', price: 90.0, description: 'Classic leather sneakers', quantity: 20 },
  { productId: 'PROD005', name: 'New Balance Fresh Foam', price: 110.0, description: 'Cushioned running shoes', quantity: 25 },
  { productId: 'PROD006', name: 'Asics Gel-Kayano', price: 130.0, description: 'Stability running shoes', quantity: 15 },
  { productId: 'PROD007', name: 'Under Armour HOVR', price: 95.0, description: 'Smart running shoes', quantity: 35 },
  { productId: 'PROD008', name: 'Vans Old Skool', price: 60.0, description: 'Iconic skate shoes', quantity: 60 },
  { productId: 'PROD009', name: 'Converse Chuck Taylor', price: 70.0, description: 'Classic canvas sneakers', quantity: 45 },
  { productId: 'PROD010', name: 'Saucony Shadow', price: 85.0, description: 'Retro running shoes', quantity: 10 },
];

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Product-Inventory Service: MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hàm seed dữ liệu sản phẩm
const seedProducts = async () => {
  try {
    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    console.log('Cleared old product data');

    // Thêm dữ liệu mẫu
    await Product.insertMany(sampleProducts);
    console.log('Seeded product data');
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

// Hàm chính để seed dữ liệu
const seedData = async () => {
  try {
    // Kết nối MongoDB
    await connectDB();

    // Seed dữ liệu
    await seedProducts();

    console.log('Product-Inventory Service: Data seeded successfully');
  } catch (error) {
    console.error('Product-Inventory Service: Seeding failed:', error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('Product-Inventory Service: MongoDB connection closed');
    process.exit(0);
  }
};

// Chạy hàm seed
seedData();