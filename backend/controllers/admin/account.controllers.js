const md5 = require('md5');
const Account = require("../../models/account.model");
const Role = require('../../models/decentralization.model');
const mongoose = require("mongoose");



// [GET]: api/admin/listAccount
module.exports.index = async (req, res) => {
    try {
        const records = await Account.find({ deleted: false }).lean();

        for (const record of records) {
            //     const role = await Role.findOne({
            //         _id: record.role_id,
            //         deleted: false
            //     });
            //    record.role = role;
            if (mongoose.Types.ObjectId.isValid(record.role_id)) {
                record.role = await Role.findOne({
                    _id: record.role_id,
                    deleted: false
                });
            } 
        }
        // console.log(records)

        res.json({
            records
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
    }

    console.log("oke")
};

// [GET]: api/admin/listAccount/create
module.exports.getCreate = async (req, res) => {
    let find = {
        deleted: false
    }

    const data = await Role.find(find);
    try {
        if (data) {
            res.json(data);
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Lỗi khi lấy vai trò' });

    }
};


//[Post] : api/admin/listAccount/create
module.exports.create = async (req, res) => {

    const emailExit = await Account.findOne({
        email: req.body.email,
        deleted: false,
    })
    if (emailExit) {
        return res.status(200).json({
            message: "Email đã tồn tại"
        });
    } else {
        req.body.password = md5(req.body.password);
        const record = new Account(req.body);

        await record.save();

        return res.status(200).json({
            message: "Tạo tài khoản thành công"
        });
    }


};

//[PATCH] : api/admin/listAccount/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id;
    const { fullname, email, phone, role_id, status } = req.body;
    const password = md5(req.body.password) ;
    console.log(req.body)
    if(id ){
            const updatedData = { fullname, email, phone, role_id, status };
            if (password) updatedData.password = password;
            await Account.updateOne({ _id: id }, { $set: updatedData });
            return res.status(200).json({ success: true, message: "Account updated successfully" });
    }
};
