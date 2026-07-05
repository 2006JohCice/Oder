const Order = require("../../models/orders.model");
const generateHelper = require("../../helpers/generate");

// Cấu hình VNPAY (Demo)
const vnp_TmnCode = process.env.VNP_TMN_CODE || "DEMO";
const vnp_HashSecret = process.env.VNP_HASH_SECRET || "DEMO_SECRET";
const vnp_Url = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = process.env.VNP_RETURN_URL || "http://localhost:3000/payment-return";

module.exports.createPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
    
    // Validate order exists
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Demo: Generate payment URL logic here
    // In production, you would generate a signature using crypto and build the VNPAY URL
    // For now, we simulate a payment URL that returns to frontend
    
    const mockPaymentUrl = `${vnp_ReturnUrl}?vnp_ResponseCode=00&vnp_TxnRef=${orderId}&vnp_Amount=${amount * 100}`;
    
    return res.status(200).json({
      message: "Tạo URL thanh toán thành công",
      paymentUrl: mockPaymentUrl
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi tạo thanh toán" });
  }
};

module.exports.vnpayReturn = async (req, res) => {
  try {
    // In production, verify vnp_SecureHash here
    const vnp_Params = req.query;
    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    if (responseCode === '00') {
      // Payment success
      await Order.updateOne(
        { _id: orderId },
        { 
          orderStatus: "paid",
          depositStatus: "paid"
        }
      );
      
      return res.status(200).json({ message: "Thanh toán thành công" });
    } else {
      // Payment failed
      return res.status(400).json({ message: "Thanh toán thất bại" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi xử lý kết quả thanh toán" });
  }
};
