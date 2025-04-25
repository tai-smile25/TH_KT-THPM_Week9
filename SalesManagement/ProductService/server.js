const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
dotenv.config();
connectDB();
console.log("MongoDB URI:", process.env.MONGODB_URI);


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});
