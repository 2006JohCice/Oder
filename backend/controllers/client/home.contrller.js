const {createTree} = require("../../helpers/createTre")
//[GET] /api/admin/category
// module.exports.index = async (req, res) => {
//     let final = {
//         deleted: false,
//     }
//     try {
//         const category = await ProductCategory.find(final).lean();
//         const newCategory =  createTree(category);
//         res.json(newCategory)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });

//     }
// }

