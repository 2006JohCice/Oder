const Voucher = require('../../models/voucher.model');

// [GET] /api/admin/platform-vouchers
module.exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ 
      restaurant_id: null,
      deleted: false 
    }).sort({ createdAt: -1 });

    res.json({ vouchers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [POST] /api/admin/platform-vouchers
module.exports.createVoucher = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, maxUsage, expirationDate, description } = req.body;

    const exist = await Voucher.findOne({ code: code.toUpperCase(), restaurant_id: null, deleted: false });
    if (exist) {
      return res.status(400).json({ message: "Mã giảm giá hệ thống đã tồn tại" });
    }

    const newVoucher = new Voucher({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      maxUsage,
      expirationDate,
      description,
      restaurant_id: null
    });

    await newVoucher.save();
    res.status(201).json({ message: "Tạo mã giảm giá hệ thống thành công", voucher: newVoucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/admin/platform-vouchers/:id
module.exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
    }
    await Voucher.updateOne({ _id: id, restaurant_id: null }, { $set: updateData });
    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [DELETE] /api/admin/platform-vouchers/:id
module.exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    await Voucher.updateOne({ _id: id, restaurant_id: null }, { deleted: true, deletedAt: new Date() });
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
