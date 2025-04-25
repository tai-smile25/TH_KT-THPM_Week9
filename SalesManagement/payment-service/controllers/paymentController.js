// Nhập mô hình Payment và thư viện CircuitBreaker
const Payment = require('../models/Payment');
const CircuitBreaker = require('opossum');

// Cấu hình CircuitBreaker
const breakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50, // là 50% số yêu cầu thất bại trước khi mở lại
    resetTimeout: 5000,
    rollingCount: 4 // Theo dõi 3 kết quả gần nhất
};

// Xử lý thanh toán
const processPayment = async (req) => {
    const { orderId, amount } = req.body;
    if (!orderId || amount <= 0) {
        throw new Error('Mã đơn hàng hoặc số tiền không hợp lệ');
    }
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
        throw new Error('Thanh toán đã tồn tại cho đơn hàng này');
    }
    const payment = new Payment({ orderId, amount, status: 'PAID' });
    await payment.save();
    return {
        orderId,
        status: payment.status,
        message: `Thanh toán thành công cho đơn hàng: ${orderId}`
    };
};

// Xử lý hoàn tiền
const refundPayment = async (req) => {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
        throw new Error('Không tìm thấy thanh toán');
    }
    if (payment.status !== 'PAID') {
        throw new Error('Thanh toán không hợp lệ để hoàn tiền');
    }
    payment.status = 'REFUNDED';
    await payment.save();
    return {
        orderId,
        status: payment.status,
        message: `Hoàn tiền thành công cho đơn hàng: ${orderId}`
    };
};

// Hàm dự phòng khi CircuitBreaker ở trạng thái Open
const processPaymentFallback = () => {
    return { message: 'Dịch vụ thanh toán tạm thời không khả dụng. Vui lòng thử lại sau.' };
};

const refundPaymentFallback = () => {
    return { message: 'Dịch vụ hoàn tiền tạm thời không khả dụng. Vui lòng thử lại sau.' };
};

// Tạo CircuitBreaker cho từng hàm
const processBreaker = new CircuitBreaker(processPayment, breakerOptions);
const refundBreaker = new CircuitBreaker(refundPayment, breakerOptions);

// Gán hàm dự phòng
processBreaker.fallback(processPaymentFallback);
refundBreaker.fallback(refundPaymentFallback);

// Theo dõi trạng thái CircuitBreaker
processBreaker.on('open', () => {
    console.log('Circuit Breaker (Thanh toán): MỞ - Dịch vụ thanh toán không khả dụng');
});
processBreaker.on('halfOpen', () => {
    console.log('Circuit Breaker (Thanh toán): NỬA MỞ - Đang kiểm tra dịch vụ thanh toán');
});
processBreaker.on('close', () => {
    console.log('Circuit Breaker (Thanh toán): ĐÓNG - Dịch vụ thanh toán hoạt động bình thường');
});
processBreaker.on('success', () => {
    console.log('Circuit Breaker (Thanh toán): Yêu cầu thành công');
});
processBreaker.on('failure', (err) => {
    console.log(`Circuit Breaker (Thanh toán): Yêu cầu thất bại - ${err.message}`);
});

refundBreaker.on('open', () => {
    console.log('Circuit Breaker (Hoàn tiền): MỞ - Dịch vụ hoàn tiền không khả dụng');
});
refundBreaker.on('halfOpen', () => {
    console.log('Circuit Breaker (Hoàn tiền): NỬA MỞ - Đang kiểm tra dịch vụ hoàn tiền');
});
refundBreaker.on('close', () => {
    console.log('Circuit Breaker (Hoàn tiền): ĐÓNG - Dịch vụ hoàn tiền hoạt động bình thường');
});
refundBreaker.on('success', () => {
    console.log('Circuit Breaker (Hoàn tiền): Yêu cầu thành công');
});
refundBreaker.on('failure', (err) => {
    console.log(`Circuit Breaker (Hoàn tiền): Yêu cầu thất bại - ${err.message}`);
});

// Hàm xử lý yêu cầu thanh toán
const processPaymentHandler = async (req, res) => {
    try {
        const result = await processBreaker.fire(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Hàm xử lý yêu cầu hoàn tiền
const refundPaymentHandler = async (req, res) => {
    try {
        const result = await refundBreaker.fire(req);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Hàm lấy trạng thái thanh toán
const getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOne({ orderId });
        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
        }
        res.status(200).json({
            orderId,
            status: payment.status,
            amount: payment.amount
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
};

// Xuất các hàm
module.exports = {
    processPayment: processPaymentHandler,
    refundPayment: refundPaymentHandler,
    getPaymentStatus
};