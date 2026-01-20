
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination")
const Product = require("../../models/product.model")
const ProductCategory = require("../../models/controllerCategory.model")
//[GET] /api/admin/products
module.exports.index = async (req, res) => {

    let final = {
        deleted: false,
    }
    if (req.query.status) {
        final.status = req.query.status;
    }
    const objSearch = searchHelper(req.query);
    if (objSearch.regex) {
        final.name = objSearch.regex;
    }
    if (req.query.category) {
        final.category = req.query.category;
    }


    //Pagination
    const countProducts = await Product.countDocuments(final);
    let objPagination = paginationHelper(
        {
            pagePage: 1,
            limitItems: 10,
        },
        req.query,
        countProducts
    )

    //Endl Pagination

    //Sort
    let sort = {};
    
    if (req.query.sortKey && req.query.sortValue) {
        const sortKey = req.query.sortKey;
        const sortValue = req.query.sortValue;
        sort[sortKey] = sortValue;
    } else {
        sort.position = "desc"; 
    }
    //End Sort
    try {
        const data = await Product.find(final)
            .sort(sort)
            //  desc giảm dần asc tăng dần
            .limit(objPagination.limitItems)
            .skip(objPagination.skip);
        // console.log({data})
        res.json({
            data,
            objPagination
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
    }
}


//[Patch] /api/admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {

    try {
        const status = req.params.status;
        const id = req.params.id;

        const result = await Product.updateOne({ _id: id }, { status: status });
        console.log(result)
        res.json({
            success: true,
            message: `Đã cập nhật sản phẩm ${id} sang trạng thái ${status}`,
            result,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
        res.status(500).json({ success: false, message: "Cập nhật thất bại" });
    }
}




//[Patch] /api/admin/products/change-multi
module.exports.changeMulti = async (req, res) => {


    try {
        const { ids, idPosition, newStatus } = req.body;
        
        if (!ids?.length || !newStatus) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }


        switch (newStatus) {
            case "active":
                await Product.updateMany(
                    { _id: { $in: ids } },
                    { $set: { status: "active" } }
                );

                break;

            case "inactive":
                await Product.updateMany(
                    { _id: { $in: ids } },
                    { $set: { status: "inactive" } }
                );

                break;
            case "delete-all":
                await Product.updateMany(
                    { _id: { $in: ids } },
                    {
                        deleted: true,
                        deletedAt: new Date(),
                    }
                );
                break
            case "change-position":
                for (const item of idPosition) {
                    await Product.updateOne(
                        { _id: item.id },
                        { $set: { position: item.position } }
                    );
                }

                break
            default:
                return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }


        return res.json({
            message: `Đã cập nhật sản phẩm sang '${newStatus}'`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server" });
    }


}

//[Delete] /api/admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {


    try {
        const { id } = req.params;
        // const deleted = await Product.findByIdAndDelete(id); xóa vĩnh viễn
        const deleted = await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() })

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm để xóa!",
            });
        }

        res.json({
            success: true,
            message: "Xóa sản phẩm thành công!",
        });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi xóa sản phẩm!",
        });
    }


}

//[GET] /api/admin/products/create
module.exports.createGet = async (req, res) => {
       let final = {
        deleted: false,
    }


    function createTree(data, parentId = "") {
        const tree = [];

        data.forEach((item) => {
            if (item.father_id === String(parentId)) {
                const newItem = item;

                const children = createTree(data, String(item._id));
               
                if (children.length > 0) {
                    newItem.children = children;
                }

                tree.push(newItem);
            }
        });

        return tree;
    }

    try {
        const category = await ProductCategory.find(final).lean();
       const newCategory =  createTree(category);
        res.json(newCategory)


    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });

    }
    
}

//[POST] /api/admin/products/create
module.exports.create = async (req, res) => {


    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)

    
    if (!req.body.position) {
        const count = await Product.countDocuments();
        req.body.position = count + 1;
    } else {
        req.body.position = parseInt(req.body.position)
    }

    // console.log(req.body)
    const product = new Product(req.body);
    await product.save();

    res.json({
        message: "Tạo sản phẩm thành công",
        product,
    });


}



//[Get] /api/admin/products/edit/:id
module.exports.edit = async (req, res) => {
    const find ={
        deleted: false,
        _id: req.params.id
    }
    const product = await Product.findOne(find);

    res.json({
        product,
    });

}



//[Patch] /api/admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
   
    // console.log("req.body",req.body)
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.stock = parseInt(req.body.stock)
    req.body.position = parseInt(req.body.position)
    
  
    try{
        await Product.updateOne({ _id: req.params.id }, req.body);
        res.json({
            message: "Cập nhật sản phẩm thành công",
        });
    }catch(error){
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({
            message: "Lỗi máy chủ khi cập nhật sản phẩm!",
        });
    }

    

}

