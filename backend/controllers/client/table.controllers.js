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
    const { restaurantId, visitDate, arrivalTime } = req.query;

    if (!restaurantId) {
      return res.status(200).json({ tables: [] });
    }

    const tables = await Table.find({
      restaurant_id: restaurantId,
    }).sort({ area: 1, displayName: 1, tableNumber: 1 });

    if (!visitDate || !arrivalTime) {
      const availableTables = tables.filter((table) => table.status === "available");
      return res.status(200).json({ tables: availableTables });
    }

    const Order = require("../../models/orders.model");
    const slotKey = `${visitDate}_${arrivalTime}`;
    const bookedOrders = await Order.find({
      restaurant_id: restaurantId,
      orderType: "dine_in",
      bookingSlotKey: slotKey,
      orderStatus: { $nin: ["completed", "cancelled"] },
    }).select("tableInfo");

    const bookedTableNumbers = new Set(bookedOrders.map((order) => String(order.tableInfo?.tableNumber || "")));
    const availableTables = tables.filter((table) => !bookedTableNumbers.has(String(table.tableNumber)));

    return res.status(200).json({ tables: availableTables });
  } catch (error) {
    return res.status(500).json({ message: "Khong the lay danh sach ban trong" });
  }
};
