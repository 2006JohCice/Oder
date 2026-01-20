const userAdmins = require("../../models/UserAdmin.model");
const paginationHelper = require("../../helpers/pagination")
const userAdmin = require("../../models/UserAdmin.model")
//[GET] /api/admin/usersAdmin
module.exports.userAdmin = async (req, res) => {

    let final = {
        deleted: false,
    }
    if (req.query.status) {
        final.status = req.query.status;
    }
    if (req.query.role) {
        final.role = req.query.role;
    }
    if (req.query.userName_email) {
        const regx = new RegExp(req.query.userName_email, "i");
        final.$or = [
            { name: regx },
            { email: regx }
        ];
    }
    //Pagination
    const countProducts = await userAdmins.countDocuments(final);
    let objPagination = paginationHelper(
        {
            pagePage: 1,
            limitItems: 8,
        },
        req.query,
        countProducts
    )

    //Endl Pagination

    try {
        const data = await userAdmins.find(final).limit(objPagination.limitItems).skip(objPagination.skip);
        res.json({
            data,
            objPagination
        }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
    }
}

//[DELETE] /api/admin/usersAdmin/:id
module.exports.deleteUserAdmin = async (req, res) => {



    try {
        const { id } = req.params
        console.log(id)
        const deleted = await userAdmin.updateOne({ _id: id }, { deleted: true})
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy user để xóa!",
            });
        }

        res.json({
            success: true,
            message: "Xóa user thành công!",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
    }

}

//[Patch] /api/admin/usersAdmin/edit/:id

module.exports.editUserAdmin = async (req,res) =>{  
  
    try {
        const userEdit = await userAdmin.updateOne({ _id: req.params.id }, req.body);
        res.json({
            userEdit,
            message: "Cập nhật người dùng thành công",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
    }
     

}