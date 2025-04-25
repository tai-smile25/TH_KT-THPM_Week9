// Nhập mô hình Shipment và thư viện CircuitBreaker
const Shipment = require('../models/Shipment');
const CircuitBreaker = require('opossum');

// Cấu hình CircuitBreaker
const breakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50, // là 50% số yêu cầu thất bại trước khi mở lại
    resetTimeout: 5000,
    rollingCount: 4 // Theo dõi 3 kết quả gần nhất
};


// Cập nhật trạng thái vận chuyển
const updateShipping = async (req) => {
    const { orderId, status } = req.body;
    if (!orderId || !['PENDING', 'SHIPPED', 'DELIVERED'].includes(status)) {
        throw new Error('Mã đơn hàng hoặc trạng thái không hợp lệ');
    }
    let shipment = await Shipment.findOne({ orderId });
    if (!shipment) {
        shipment = new Shipment({ orderId, status });
    } else {
        shipment.status = status;
        shipment.updatedAt = new Date();
    }
    await shipment.save();
    return {
        orderId,
        status,
        message: `Cập nhật trạng thái vận chuyển thành công cho đơn hàng: ${orderId}`
    };
};

// Hàm dự phòng khi CircuitBreaker ở trạng thái Open
const updateShippingFallback = () => {
    return { message: 'Dịch vụ vận chuyển tạm thời không khả dụng. Vui lòng thử lại sau.' };
};

// Tạo CircuitBreaker cho hàm updateShipping
const updateBreaker = new CircuitBreaker(updateShipping, breakerOptions);

// Gán hàm dự phòng
updateBreaker.fallback(updateShippingFallback);

// Theo dõi trạng thái CircuitBreaker
updateBreaker.on('open', () => {
    console.log('Circuit Breaker (Cập nhật vận chuyển): MỞ - Dịch vụ vận chuyển không khả dụng');
});
updateBreaker.on('halfOpen', () => {
    console.log('Circuit Breaker (Cập nhật vận chuyển): NỬA MỞ - Đang kiểm tra dịch vụ vận chuyển');
});
updateBreaker.on('close', () => {
    console.log('Circuit Breaker (Cập nhật vận chuyển): ĐÓNG - Dịch vụ vận chuyển hoạt động bình thường');
});
updateBreaker.on('success', () => {
    console.log('Circuit Breaker (Cập nhật vận chuyển): Yêu cầu thành công');
});
updateBreaker.on('failure', (err) => {
    console.log(`Circuit Breaker (Cập nhật vận chuyển): Yêu cầu thất bại - ${err.message}`);
});

// Hàm xử lý yêu cầu cập nhật trạng thái vận chuyển
const updateShippingHandler = async (req, res) => {
    try {
        const result = await updateBreaker.fire(req);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Hàm lấy trạng thái vận chuyển
const getShippingStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const shipment = await Shipment.findOne({ orderId });
        if (!shipment) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin vận chuyển' });
        }
        res.status(200).json({
            orderId,
            status: shipment.status
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};

// Xuất các hàm
module.exports = {
    updateShipping: updateShippingHandler,
    getShippingStatus
};