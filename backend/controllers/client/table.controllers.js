// const Table = require("../../models/table.model");
// const TABLE_CATALOG = require("../../helpers/tableCatalog");

// const ensureTables = async () => {
//   await Table.bulkWrite(
//     TABLE_CATALOG.map((table) => ({
//       updateOne: {
//         filter: {
//           restaurant_id: table.restaurant_id,
//           tableNumber: table.tableNumber,
//         },
//         update: {
//           $setOnInsert: table,
//         },
//         upsert: true,
//       },
//     }))
//   );
// };

// module.exports.ensureTables = ensureTables;

// module.exports.available = async (req, res) => {
//   try {
//     const { restaurantId, visitDate, arrivalTime } = req.query;

//     if (!restaurantId) {
//       return res.status(200).json({ tables: [] });
//     }

//     const tables = await Table.find({
//       restaurant_id: restaurantId,
//     }).sort({ area: 1, displayName: 1, tableNumber: 1 });

//     if (!visitDate || !arrivalTime) {
//       const availableTables = tables.filter((table) => table.status === "available");
//       return res.status(200).json({ tables: availableTables });
//     }

//     const Order = require("../../models/orders.model");
//     const slotKey = `${visitDate}_${arrivalTime}`;
//     const bookedOrders = await Order.find({
//       restaurant_id: restaurantId,
//       orderType: "dine_in",
//       bookingSlotKey: slotKey,
//       orderStatus: { $nin: ["completed", "cancelled"] },
//     }).select("tableInfo");

//     const bookedTableNumbers = new Set(bookedOrders.map((order) => String(order.tableInfo?.tableNumber || "")));
//     const availableTables = tables.filter((table) => !bookedTableNumbers.has(String(table.tableNumber)));

//     return res.status(200).json({ tables: availableTables });
//   } catch (error) {
//     return res.status(500).json({ message: "Khong the lay danh sach ban trong" });
//   }
// };


const Table = require("../../models/table.model");
const Order = require("../../models/orders.model");

module.exports.available = async (req, res) => {
  try {
    const {
      restaurantId,
      visitDate,
      arrivalTime,
    } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        message: "restaurantId required",
      });
    }

    const tables = await Table.find({
      restaurant_id: restaurantId,
    }).sort({
      area: 1,
      tableNumber: 1,
    });

    if (!visitDate || !arrivalTime) {
      return res.status(200).json({
        allTables: tables,
        tables: tables.filter(
          (table) => table.status === "available"
        ),
      });
    }

    const bookingSlotKey = `${visitDate}_${arrivalTime}`;

    const bookedOrders = await Order.find({
      restaurant_id: restaurantId,
      orderType: "dine_in",
      bookingSlotKey,
      orderStatus: {
        $nin: ["cancelled", "completed"],
      },
    }).select("tableInfo");

    const bookedTableNumbers = new Set(
      bookedOrders.map((order) => String(order.tableInfo?.tableNumber))
    );

    const availableTables = tables.filter(
      (table) => table.status === "available" && !bookedTableNumbers.has(String(table.tableNumber))
    );

    return res.status(200).json({
      allTables: tables,
      tables: availableTables,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Không thể lấy danh sách bàn",
    });
  }
};