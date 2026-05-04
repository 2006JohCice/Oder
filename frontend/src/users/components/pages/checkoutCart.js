import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import { calculateLineTotal, formatCurrency, getTableLabel } from "../../utils/shop";
import FeaturedProducts from "../MainContents/products/featuredProducts";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

const defaultForm = {
  fullName: "",
  phone: "",
  address: "",
  orderType: "dine_in",
  tableInfo: {
    area: "",
    tableNumber: "",
    guestCount: 2,
    arrivalTime: "",
    note: "",
  },
};

export default function CheckoutCart() {
  const [cartItems, setCartItems] = useState({});
  const [cartRestaurantId, setCartRestaurantId] = useState("");
  const [formData, setFormData] = useState(defaultForm);
  const [availableTables, setAvailableTables] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  useEffect(() => {
    if (new URLSearchParams(location.search).get("mode") === "table") {
      setFormData((prev) => ({ ...prev, orderType: "dine_in" }));
    }
  }, [location.search]);

  useEffect(() => {
    const loadCart = async () => {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        navigate("/user/auth/login");
        return;
      }

      const data = await res.json();
      setCartItems(data || {});
      setCartRestaurantId(data?.restaurant_id || "");
    };

    loadCart();
  }, [navigate]);

  useEffect(() => {
    if (formData.orderType !== "dine_in") return;
    if (!cartRestaurantId) {
      setAvailableTables([]);
      return;
    }

    const fetchAvailableTables = async () => {
      setIsLoadingTables(true);
      const res = await fetch(`/api/tables/available?restaurantId=${cartRestaurantId}`);

      if (res.status === 401) {
        navigate("/user/auth/login");
        return;
      }

      const data = await res.json();
      const tables = Array.isArray(data.tables) ? data.tables : [];
      setAvailableTables(tables);

      setFormData((prev) => {
        const tableStillAvailable = tables.find((table) => table.tableNumber === prev.tableInfo.tableNumber);
        if (tableStillAvailable) {
          return {
            ...prev,
            tableInfo: { ...prev.tableInfo, area: tableStillAvailable.area },
          };
        }

        return {
          ...prev,
          tableInfo: { ...prev.tableInfo, area: "", tableNumber: "" },
        };
      });

      setIsLoadingTables(false);
    };

    fetchAvailableTables();
  }, [formData.orderType, navigate, cartRestaurantId]);

  const products = Array.isArray(cartItems?.products) ? cartItems.products : [];
  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      tableInfo: {
        ...prev.tableInfo,
        [name]: name === "guestCount" ? Number(value) : value,
      },
    }));
  };

  const handleSelectTable = (table) => {
    setFormData((prev) => ({
      ...prev,
      tableInfo: {
        ...prev.tableInfo,
        tableNumber: table.tableNumber,
        area: table.area,
      },
    }));
  };

  const handleDonePay = async (event) => {
    event.preventDefault();

    const res = await fetch("/api/checkout/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.status === 401) {
      notifyApp("Vui long dang nhap de dat hang", "info");
      navigate("/user/auth/login");
      return;
    }

    const data = await res.json();
    if (!res.ok) {
      notifyApp(data.message, "error");
      if (formData.orderType === "dine_in" && cartRestaurantId) {
        const tableRes = await fetch(`/api/tables/available?restaurantId=${cartRestaurantId}`);
        const tableData = await tableRes.json();
        setAvailableTables(Array.isArray(tableData.tables) ? tableData.tables : []);
      }
      return;
    }

    await fetchCart();
    notifyApp("Dat hang thanh cong", "success");
    navigate(`/cart/checkout/success/${data.orderId}`);
  };

  if (products.length === 0) {
    return (
      <div className="page-stack">
        <section className="success-shell">
          <article className="success-card">
            <div className="success-icon"><i className="bi bi-basket3" /></div>
            <p className="eyebrow">Chua the thanh toan</p>
            <h1>Gio hang hien dang trong.</h1>
            <p>Vui long them mon an truoc khi di den buoc thanh toan hoac dat ban.</p>
            <div className="empty-state-actions">
              <Link to="/products" className="primary-button no-underline ">Di toi san pham</Link>
              <Link to="/" className="secondary-button no-underline ">Ve trang chu</Link>
            </div>
          </article>
        </section>
        <FeaturedProducts />
      </div>
    );
  }

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Thanh toan moi</p>
          <h2>Chon ban trong, xac nhan mon va gui don trong cung mot man hinh</h2>
        </div>
      </div>

      <div className="order-layout">
        <div className="table-card">
          <div className="order-list">
            {products.map((item, index) => (
              <article className="order-item" key={`${item.product_id}-${index}`}>
                <img src={item.productInfo?.img} alt={item.productInfo?.name} />
                <div className="order-item-copy">
                  <strong>{item.productInfo?.name}</strong>
                  <span>So luong: {item.quantity}</span>
                </div>
                <strong>{formatCurrency(calculateLineTotal(item))}</strong>
              </article>
            ))}
          </div>
        </div>

        <form className="summary-card checkout-form" onSubmit={handleDonePay}>
          <div className="toggle-row">
            <button type="button" className={formData.orderType === "dine_in" ? "toggle active" : "toggle"} onClick={() => setFormData((prev) => ({ ...prev, orderType: "dine_in" }))}>An tai ban</button>
            <button type="button" className={formData.orderType === "delivery" ? "toggle active" : "toggle"} onClick={() => setFormData((prev) => ({ ...prev, orderType: "delivery" }))}>Giao tan noi</button>
          </div>

          <div className="form-grid">
            <label>Ho va ten<input name="fullName" value={formData.fullName} onChange={handleChange} required /></label>
            <label>So dien thoai<input name="phone" value={formData.phone} onChange={handleChange} required /></label>

            {formData.orderType === "delivery" && (
              <label className="field-span">Dia chi giao hang<input name="address" value={formData.address} onChange={handleChange} required /></label>
            )}

            {formData.orderType === "dine_in" && (
              <>
                <div className="field-span">
                  <span style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>Danh sach ban trong</span>
                  {isLoadingTables ? (
                    <p>Dang tai danh sach ban...</p>
                  ) : availableTables.length === 0 ? (
                    <p>Hien khong con ban trong.</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                      {availableTables.map((table) => {
                        const isSelected = formData.tableInfo.tableNumber === table.tableNumber;
                        return (
                          <button key={table._id || table.tableNumber} type="button" onClick={() => handleSelectTable(table)} style={{ border: isSelected ? "2px solid #1f7a5a" : "1px solid #d9e3dc", borderRadius: 8, background: isSelected ? "#eef9f4" : "#fff", padding: 12, textAlign: "left", cursor: "pointer" }}>
                            <strong style={{ display: "block", marginBottom: 6 }}>{table.displayName || table.tableNumber}</strong>
                            <span style={{ display: "block", fontSize: 13 }}>{table.area}</span>
                            <span style={{ display: "block", marginTop: 6, fontSize: 13 }}>{table.capacity} khach</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <label>Ban da chon<input value={getTableLabel(formData.tableInfo.tableNumber ? formData.tableInfo : null)} readOnly placeholder="Chon mot ban trong" /></label>
                <label>So khach<input type="number" min="1" name="guestCount" value={formData.tableInfo.guestCount} onChange={handleTableChange} /></label>
                <label>Gio den du kien<input type="time" name="arrivalTime" value={formData.tableInfo.arrivalTime} onChange={handleTableChange} /></label>
                <label className="field-span">Ghi chu ban an<textarea rows="3" name="note" value={formData.tableInfo.note} onChange={handleTableChange} placeholder="Sinh nhat, can khong gian rieng..." /></label>
              </>
            )}
          </div>

          <div className="summary-row"><span>Tong so luong</span><strong>{totalQuantity}</strong></div>
          <div className="summary-row"><span>Tong tien</span><strong>{formatCurrency(cartItems?.totalCartPrice)}</strong></div>
          <button className="primary-button full-width" type="submit" disabled={formData.orderType === "dine_in" && !formData.tableInfo.tableNumber}>Xac nhan don hang</button>
        </form>
      </div>
    </section>
  );
}
