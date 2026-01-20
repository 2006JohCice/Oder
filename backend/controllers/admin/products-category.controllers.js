
const ProductCategory = require("../../models/controllerCategory.model")
const {createTree} = require("../../helpers/createTre")
//[GET] /api/admin/category
module.exports.index = async (req, res) => {
    let final = {
        deleted: false,
    }


    try {
        const category = await ProductCategory.find(final).lean();
       const newCategory =  createTree(category);
        // console.log("newCategory", newCategory);
        res.json(newCategory)


    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });

    }
}


//[POST] /api/admin/category/create
module.exports.create = async (req, res) => {


    if (!req.body.position) {
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position)
    }

    const category = new ProductCategory(req.body);
    await category.save();

    res.json({
        message: "Tạo danh mục thành công",
        category,
    });

}

// [GET] /api/admin/category/edit/:id
module.exports.edit = async (req,res) =>{
    const id = req.params.id;
    
    const data = await ProductCategory.findOne(
        {
            _id: id,
            deleted: false,

        }
    )


    try {
        if (data) {


           res.json(data);
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
    }
    

}
// [PATCH] /api/admin/category/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;

    // Prevent setting itself as its own parent
    if (req.body.father_id === req.params.id) {
        return res.status(400).json({ message: "Không thể chọn chính nó làm danh mục cha!" });
    }

    try {
        const category = await ProductCategory.findOneAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        );
        if (category) {
            res.json({
                message: "Cập nhật danh mục thành công",
                category,
            });
        } else {
            res.status(404).json({ message: 'Danh mục không tồn tại' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật dữ liệu' });
    }
}


