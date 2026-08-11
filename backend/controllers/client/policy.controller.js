const Policy = require("../../models/policy.model");

// [GET] /api/policies
module.exports.getAllActivePolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ isActive: true }).select('-__v -createdAt -updatedAt').sort({ createdAt: 1 });
    res.json(policies);
  } catch (error) {
    console.error("Lỗi lấy danh sách policy client:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
