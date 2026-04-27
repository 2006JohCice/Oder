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

export const DINING_AREAS = ["Sân vườn", "Tầng 1", "Tầng 2", "Phòng riêng"];

export const TABLE_OPTIONS = [
  "A01", "A02", "A03", "A04",
  "B01", "B02", "B03", "B04",
  "VIP1", "VIP2", "VIP3"
];
