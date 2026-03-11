const userAccount = require("../../models/user.model");
const paginationHelper = require("../../helpers/pagination")
module.exports.index = async (req, res) => {
  // console.log("đã vào được userAccount controller")
  let final = { deleted: false };
  //Pagination
  const countUser = await userAccount.countDocuments(final);
  let objPagination = paginationHelper(
    {
      pagePage: 1,
      limitItems: 10,
    },
    req.query,
    countUser
  );

  //Endl Pagination

  try {
    const data = await userAccount.find(final)
    .limit(objPagination.limitItems)
    .skip(objPagination.skip);
    res.json({
         data,
        objPagination
     });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
  }
};
