// Nhập mô hình Product và thư viện CircuitBreaker
const Product = require('../models/Product');
const CircuitBreaker = require('opossum');

// Cấu hình CircuitBreaker
const breakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50, // là 50% số yêu cầu thất bại trước khi mở lại
    resetTimeout: 5000,
    rollingCount: 4 // Theo dõi 3 kết quả gần nhất
};

// Tạo sản phẩm
const createProduct = async (req) => {
    const { name, price, description, quantity } = req.body;
    if (!name || !price || quantity < 0) {
        throw new Error('Dữ liệu sản phẩm không hợp lệ');
    }
    const productId = `PROD-${Date.now()}`;
    const product = new Product({ productId, name, price, description, quantity });
    await product.save();
    return {
        productId,
        name,
        price,
        quantity,
        message: `Tạo sản phẩm thành công: ${productId}`
    };
};

// Cập nhật tồn kho
const updateInventory = async (req) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity <= 0) {
        throw new Error('Mã sản phẩm hoặc số lượng không hợp lệ');
    }
    const product = await Product.findOne({ productId });
    if (!product || product.quantity < quantity) {
        throw new Error('Tồn kho không đủ');
    }
    product.quantity -= quantity;
    product.updatedAt = new Date();
    await product.save();
    return {
        productId,
        remainingQuantity: product.quantity,
        message: `Cập nhật tồn kho thành công cho sản phẩm: ${productId}`
    };
};

// Hàm dự phòng khi CircuitBreaker ở trạng thái Open
const createProductFallback = () => {
    return { message: 'Dịch vụ sản phẩm tạm thời không khả dụng. Vui lòng thử lại sau.' };
};

const updateInventoryFallback = () => {
    return { message: 'Dịch vụ tồn kho tạm thời không khả dụng. Vui lòng thử lại sau.' };
};

// Tạo CircuitBreaker cho từng hàm
const createBreaker = new CircuitBreaker(createProduct, breakerOptions);
const updateBreaker = new CircuitBreaker(updateInventory, breakerOptions);

// Gán hàm dự phòng
createBreaker.fallback(createProductFallback);
updateBreaker.fallback(updateInventoryFallback);

// Theo dõi trạng thái CircuitBreaker
createBreaker.on('open', () => {
    console.log('Circuit Breaker (Tạo sản phẩm): MỞ - Dịch vụ sản phẩm không khả dụng');
});
createBreaker.on('halfOpen', () => {
    console.log('Circuit Breaker (Tạo sản phẩm): NỬA MỞ - Đang kiểm tra dịch vụ sản phẩm');
});
createBreaker.on('close', () => {
    console.log('Circuit Breaker (Tạo sản phẩm): ĐÓNG - Dịch vụ sản phẩm hoạt động bình thường');
});
createBreaker.on('success', () => {
    console.log('Circuit Breaker (Tạo sản phẩm): Yêu cầu thành công');
});
createBreaker.on('failure', (err) => {
    console.log(`Circuit Breaker (Tạo sản phẩm): Yêu cầu thất bại - ${err.message}`);
});

updateBreaker.on('open', () => {
    console.log('Circuit Breaker (Cập nhật tồn kho): MỞ - Dịch vụ tồn kho không khả dụng');
});
updateBreaker.on('halfOpen', () => {
    console.log('Circuit Breaker (Cập nhật tồn kho): NỬA MỞ - Đang kiểm tra dịch vụ tồn kho');
});
updateBreaker.on('close', () => {
    console.log('Circuit Breaker (Cập nhật tồn kho): ĐÓNG - Dịch vụ tồn kho hoạt động bình thường');
});
updateBreaker.on('success', () => {
    console.log('Circuit Breaker (Cập nhật tồn kho): Yêu cầu thành công');
});
updateBreaker.on('failure', (err) => {
    console.log(`Circuit Breaker (Cập nhật tồn kho): Yêu cầu thất bại - ${err.message}`);
});

// Hàm xử lý yêu cầu tạo sản phẩm
const createProductHandler = async (req, res) => {
    try {
        const result = await createBreaker.fire(req);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Hàm lấy thông tin sản phẩm
const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({
            productId,
            name: product.name,
            price: product.price,
            quantity: product.quantity
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Hàm xử lý yêu cầu cập nhật tồn kho
const updateInventoryHandler = async (req, res) => {
    try {
        const result = await updateBreaker.fire(req);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Hàm lấy trạng thái tồn kho
const getInventoryStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({
            productId,
            quantity: product.quantity
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Xuất các hàm
module.exports = {
    createProduct: createProductHandler,
    getProduct,
    updateInventory: updateInventoryHandler,
    getInventoryStatus
};