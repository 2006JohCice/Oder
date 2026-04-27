export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDateTime = (value) => {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const calculateLineTotal = (item) =>
  Number(item?.productInfo?.price ?? item?.price ?? 0) * Number(item?.quantity ?? 0);

export const getOrderTotal = (products = []) =>
  products.reduce((sum, item) => sum + calculateLineTotal(item), 0);

export const TABLE_OPTIONS = [
  { tableNumber: "A01", area: "San vuon", capacity: 4 },
  { tableNumber: "A02", area: "San vuon", capacity: 4 },
  { tableNumber: "A03", area: "San vuon", capacity: 6 },
  { tableNumber: "A04", area: "San vuon", capacity: 6 },
  { tableNumber: "B01", area: "Tang 1", capacity: 4 },
  { tableNumber: "B02", area: "Tang 1", capacity: 4 },
  { tableNumber: "B03", area: "Tang 1", capacity: 6 },
  { tableNumber: "B04", area: "Tang 1", capacity: 6 },
  { tableNumber: "VIP1", area: "Phong rieng", capacity: 8 },
  { tableNumber: "VIP2", area: "Phong rieng", capacity: 8 },
  { tableNumber: "VIP3", area: "Phong rieng", capacity: 10 },
];

export const DINING_AREAS = [...new Set(TABLE_OPTIONS.map((table) => table.area))];

export const getTableLabel = (table) => {
  if (!table) return "";
  return `${table.tableNumber} - ${table.area}`;
};
