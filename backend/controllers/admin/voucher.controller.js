const Voucher = require('../../models/voucher.model');
const Restaurant = require('../../models/restaurant.model');

// [GET] /api/admin/vouchers
module.exports.getVouchers = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner_id: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "Không tìm thấy nhà hàng" });

    const vouchers = await Voucher.find({ 
      restaurant_id: restaurant._id,
      deleted: false 
    }).sort({ createdAt: -1 });

    res.json({ vouchers });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [POST] /api/admin/vouchers
module.exports.createVoucher = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner_id: req.user.id });
    if (!restaurant) return res.status(404).json({ message: "Không tìm thấy nhà hàng" });

    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, expirationDate, description } = req.body;

    // Check if code already exists
    const exist = await Voucher.findOne({ code: code.toUpperCase(), restaurant_id: restaurant._id, deleted: false });
    if (exist) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const newVoucher = new Voucher({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      expirationDate,
      description,
      restaurant_id: restaurant._id
    });

    await newVoucher.save();
    res.status(201).json({ message: "Tạo mã giảm giá thành công", voucher: newVoucher });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/admin/vouchers/:id
module.exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    await Voucher.updateOne({ _id: id }, { $set: updateData });
    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [DELETE] /api/admin/vouchers/:id
module.exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await Voucher.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
