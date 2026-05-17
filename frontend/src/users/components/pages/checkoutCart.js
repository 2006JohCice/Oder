import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../mixi/cart/CartContext";
import { calculateLineTotal, formatCurrency, getTableLabel } from "../../utils/shop";
import FeaturedProducts from "../MainContents/products/featuredProducts";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import LoadingButton from "../../../shared/components/LoadingButton";
import useButtonLoading from "../../../shared/hooks/useButtonLoading";

const createRestaurantForm = (group, forceTableMode = false) => ({
  restaurantId: group.restaurantId,
  restaurantName: group.restaurantName,
  fullName: "",
  phone: "",
  address: "",
  orderType: forceTableMode ? "dine_in" : "delivery",
  tableInfo: {
    area: "",
    tableNumber: "",
    guestCount: 2,
    visitDate: "",
    arrivalTime: "",
    note: "",
  },
  relativeContact: {
    fullName: "",
    phone: "",
    relationship: "",
  },
  availableTables: [],
  needRelativeContact: false,
});

export default function CheckoutCart() {
  const [cartData, setCartData] = useState({});
  const [forms, setForms] = useState([]);
  const [depositAmount, setDepositAmount] = useState(200000);
  const { isLoading: isLoadingCheckout, handleLoading: handleLoadingCheckout } = useButtonLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  const forceTableMode = new URLSearchParams(location.search).get("mode") === "table";
  const groups = Array.isArray(cartData?.restaurantGroups) ? cartData.restaurantGroups : [];
  useEffect(() => {
    const loadCheckoutMeta = async () => {
      const checkoutRes = await fetch("/api/checkout", { credentials: "include" });
      const checkoutData = await checkoutRes.json().catch(() => ({}));
      if (checkoutRes.ok) {
        setDepositAmount(checkoutData.depositAmount || 200000);
      }
    };

    loadCheckoutMeta();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.status === 401) {
        navigate("/user/auth/login");
        return;
      }

      const data = await res.json();
      const restaurantGroups = Array.isArray(data?.restaurantGroups) ? data.restaurantGroups : [];
      setCartData(data || {});
      setForms((prev) =>
        restaurantGroups.map((group) => {
          const existing = prev.find((item) => item.restaurantId === group.restaurantId);
          return existing || createRestaurantForm(group, forceTableMode);
        })
      );
    };

    loadCart();
  }, [forceTableMode, navigate]);

  const totalQuantity = useMemo(
    () => groups.reduce((sum, group) => sum + Number(group.totalQuantity || 0), 0),
    [groups]
  );

  const updateForm = (restaurantId, updater) => {
    setForms((prev) =>
      prev.map((item) => (item.restaurantId === restaurantId ? updater(item) : item))
    );
  };

  const fetchAvailableTables = async (restaurantId, visitDate, arrivalTime) => {
    if (!restaurantId) {
      return;
    }

    const params = new URLSearchParams({ restaurantId });
    if (visitDate) params.set("visitDate", visitDate);
    if (arrivalTime) params.set("arrivalTime", arrivalTime);

    if (!visitDate || !arrivalTime) {
      const res = await fetch(`/api/tables/available?${params.toString()}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      updateForm(restaurantId, (current) => ({
        ...current,
        availableTables: Array.isArray(data.tables) ? data.tables : [],
        needRelativeContact: false,
      }));
      return;
    }

    const res = await fetch(`/api/tables/available?${params.toString()}`, { credentials: "include" });
    const data = await res.json();
    updateForm(restaurantId, (current) => ({
      ...current,
      availableTables: Array.isArray(data.tables) ? data.tables : [],
      needRelativeContact: false,
    }));
  };

  const handleBasicChange = (restaurantId, field, value) => {
    updateForm(restaurantId, (current) => ({ ...current, [field]: value }));
  };

  const handleTableChange = (restaurantId, field, value) => {
    updateForm(restaurantId, (current) => {
      const next = {
        ...current,
        tableInfo: {
          ...current.tableInfo,
          [field]: field === "guestCount" ? Number(value) : value,
        },
      };
      return next;
    });
  };

  const handleRelativeChange = (restaurantId, field, value) => {
    updateForm(restaurantId, (current) => ({
      ...current,
      relativeContact: {
        ...current.relativeContact,
        [field]: value,
      },
    }));
  };

  const handleOrderTypeChange = (restaurantId, orderType) => {
    updateForm(restaurantId, (current) => ({
      ...current,
      orderType,
      tableInfo: orderType === "dine_in" ? current.tableInfo : createRestaurantForm({ restaurantId }).tableInfo,
      relativeContact: orderType === "dine_in" ? current.relativeContact : createRestaurantForm({ restaurantId }).relativeContact,
      availableTables: orderType === "dine_in" ? current.availableTables : [],
      needRelativeContact: false,
    }));

    if (orderType === "dine_in") {
      fetchAvailableTables(restaurantId, "", "");
    }
  };

  const handleDonePay = async (event) => {
    event.preventDefault();

    await handleLoadingCheckout(async () => {
      try {
        const payload = {
          restaurantOrders: forms.map((item) => ({
            restaurantId: item.restaurantId,
            fullName: item.fullName,
            phone: item.phone,
            address: item.address,
            orderType: item.orderType,
            tableInfo: item.tableInfo,
            relativeContact:
              item.orderType === "dine_in" &&
              item.relativeContact.fullName &&
              item.relativeContact.phone
                ? item.relativeContact
                : null,
          })),
        };

        const res = await fetch("/api/checkout/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (res.status === 401) {
          notifyApp("Vui long dang nhap de dat hang", "info");
          navigate("/user/auth/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          notifyApp(data.message, "error");
          return;
        }

        await fetchCart();
        notifyApp("Dat hang thanh cong", "success");
        navigate(`/cart/checkout/success/${data.orderId}`);
      } catch (error) {
        console.error("Checkout error:", error);
        notifyApp("Loi khi dat hang. Vui long thu lai.", "error");
      }
    });
  };


  if (!groups.length) {
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
          <p className="eyebrow">Thanh Toán Ngay</p>
          <h1>Kiểm tra lại đơn hàng của bạn</h1>
        </div>
      </div>
      <form className="page-stack" onSubmit={handleDonePay}>
        {groups.map((group) => {
          const form = forms.find((item) => item.restaurantId === group.restaurantId) || createRestaurantForm(group, forceTableMode);

          return (
            <div className="order-layout" key={group.restaurantId || group.restaurantName}>
              <div className="table-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{group.restaurantName}</p>
                    <h3>{group.totalQuantity} mon - {formatCurrency(group.totalAmount)}</h3>
                  </div>
                  <div className="admin-muted">
                    {Number(group.ratingAverage || 0).toFixed(1)} sao • {group.orderCount || 0} luot mua . {group.timestamps}
                  </div>
                </div>

                <div className="order-list">
                  {group.products.map((item, index) => (
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

              <div className="summary-card checkout-form">
                <div className="toggle-row">
                  <button
                    type="button"
                    className={form.orderType === "dine_in" ? "toggle active" : "toggle"}
                    onClick={() => handleOrderTypeChange(group.restaurantId, "dine_in")}
                  >
                    Dat ban
                  </button>
                  <button
                    type="button"
                    className={form.orderType === "delivery" ? "toggle active" : "toggle"}
                    onClick={() => handleOrderTypeChange(group.restaurantId, "delivery")}
                  >
                    Giao tan noi
                  </button>
                </div>

                <div className="form-grid">
                  <label>Ho va ten<input value={form.fullName} onChange={(e) => handleBasicChange(group.restaurantId, "fullName", e.target.value)} required /></label>
                  <label>So dien thoai<input value={form.phone} onChange={(e) => handleBasicChange(group.restaurantId, "phone", e.target.value)} required /></label>

                  {form.orderType === "delivery" && (
                    <label className="field-span">Dia chi giao hang<input value={form.address} onChange={(e) => handleBasicChange(group.restaurantId, "address", e.target.value)} required /></label>
                  )}

                  {form.orderType === "dine_in" && (
                    <>
                      <label>Ngay den
                        <input
                          type="date"
                          value={form.tableInfo.visitDate}
                          onChange={(e) => {
                            handleTableChange(group.restaurantId, "visitDate", e.target.value);
                            fetchAvailableTables(group.restaurantId, e.target.value, form.tableInfo.arrivalTime);
                          }}
                          required
                        />
                      </label>
                      <label>Gio den du kien
                        <input
                          type="time"
                          value={form.tableInfo.arrivalTime}
                          onChange={(e) => {
                            handleTableChange(group.restaurantId, "arrivalTime", e.target.value);
                            fetchAvailableTables(group.restaurantId, form.tableInfo.visitDate, e.target.value);
                          }}
                          required
                        />
                      </label>

                      <div className="field-span">
                        <span style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>Danh sach ban trong</span>
                        {form.availableTables.length === 0 ? (
                          <p>Chon ngay va gio de xem ban trong. Neu khung gio da co khach, ban thu hai can thong tin nguoi than.</p>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                            {form.availableTables.map((table) => {
                              const isSelected = form.tableInfo.tableNumber === table.tableNumber;
                              return (
                                <button
                                  key={table._id || table.tableNumber}
                                  type="button"
                                  onClick={() => {
                                    handleTableChange(group.restaurantId, "tableNumber", table.tableNumber);
                                    handleTableChange(group.restaurantId, "area", table.area);
                                  }}
                                  style={{
                                    border: isSelected ? "2px solid #1f7a5a" : "1px solid #d9e3dc",
                                    borderRadius: 8,
                                    background: isSelected ? "#eef9f4" : "#fff",
                                    padding: 12,
                                    textAlign: "left",
                                    cursor: "pointer",
                                  }}
                                >
                                  <strong style={{ display: "block", marginBottom: 6 }}>{table.displayName || table.tableNumber}</strong>
                                  <span style={{ display: "block", fontSize: 13 }}>{table.area}</span>
                                  <span style={{ display: "block", marginTop: 6, fontSize: 13 }}>{table.capacity} khach</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <label>Ban da chon<input value={getTableLabel(form.tableInfo.tableNumber ? form.tableInfo : null)} readOnly placeholder="Chon mot ban trong" /></label>
                      <label>So khach<input type="number" min="1" value={form.tableInfo.guestCount} onChange={(e) => handleTableChange(group.restaurantId, "guestCount", e.target.value)} /></label>
                      <label className="field-span">Ghi chu ban an<textarea rows="3" value={form.tableInfo.note} onChange={(e) => handleTableChange(group.restaurantId, "note", e.target.value)} placeholder="Sinh nhat, can khong gian rieng..." /></label>

                      <div className="field-span checkout-deposit-card">
                        <strong>Coc dat ban demo: {formatCurrency(depositAmount)}</strong>
                        <p>Thong tin coc duoc gui sang trang quan tri cua nha hang sau khi dat ban.</p>
                      </div>

                      <div className="field-span">
                        <span style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Thong tin nguoi than cho ban thu hai neu trung gio</span>
                        <div className="form-grid">
                          <label>Ten nguoi than<input value={form.relativeContact.fullName} onChange={(e) => handleRelativeChange(group.restaurantId, "fullName", e.target.value)} placeholder="Nhap khi can dat ban thu hai" /></label>
                          <label>So dien thoai<input value={form.relativeContact.phone} onChange={(e) => handleRelativeChange(group.restaurantId, "phone", e.target.value)} placeholder="So dien thoai nguoi than" /></label>
                          <label className="field-span">Moi quan he<input value={form.relativeContact.relationship} onChange={(e) => handleRelativeChange(group.restaurantId, "relationship", e.target.value)} placeholder="Vo, chong, anh chi em..." /></label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <aside className="summary-card">
          <h3>Tom tat thanh toan</h3>
          <div className="summary-row">
            <span>So nha hang</span>
            <strong>{groups.length}</strong>
          </div>
          <div className="summary-row">
            <span>Tong so luong</span>
            <strong>{totalQuantity}</strong>
          </div>
          <div className="summary-row">
            <span>Tong tien hang</span>
            <strong>{formatCurrency(cartData?.totalCartPrice)}</strong>
          </div>
          <div className="summary-row">
            <span>Tong coc ban</span>
            <strong>{formatCurrency(forms.filter((item) => item.orderType === "dine_in").length * depositAmount)}</strong>
          </div>
          <LoadingButton
            className="primary-button full-width"
            type="submit"
            isLoading={isLoadingCheckout}
            loadingText="Dang xac nhan..."
            variant="primary"
          >
            Xac nhan don hang
          </LoadingButton>
        </aside>
      </form>
    </section>
  );
}
