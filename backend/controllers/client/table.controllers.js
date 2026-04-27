const Table = require("../../models/table.model");
const TABLE_CATALOG = require("../../helpers/tableCatalog");

const ensureTables = async () => {
  await Table.bulkWrite(
    TABLE_CATALOG.map((table) => ({
      updateOne: {
        filter: { tableNumber: table.tableNumber },
        update: { $setOnInsert: table },
        upsert: true,
      },
    }))
  );
};

module.exports.ensureTables = ensureTables;

module.exports.available = async (req, res) => {
  try {
    await ensureTables();

    const tables = await Table.find({ status: "available" }).sort({ area: 1, tableNumber: 1 });

    return res.status(200).json({ tables });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Khong the lay danh sach ban trong" });
  }
};
