const advertisementModel = require('../../models/advertisemen.model');

// [GET] /admin/advertisements
module.exports.getAdvertisements = async (req, res) => {
    // console.log("Get advertisements called");
    try {
        const advertisements = await advertisementModel.findOne();
        res.status(200).json(advertisements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// [POST] /admin/advertisement
module.exports.updateAdvertisements = async (req, res) => {
    try {
        const { ads1 = [], ads2 = [] } = req.body;
        console.log("Update advertisements called with data:", { ads1, ads2 });

        // Update hoặc tạo mới nếu chưa có
        const updatedAdvertisement = await advertisementModel.findOneAndUpdate(
            {},
            {
                $set: {
                    "ads1.images": ads1,
                    "ads2.images": ads2
                }
            },
            { upsert: true, new: true }
        );
        res.status(200).json(updatedAdvertisement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};