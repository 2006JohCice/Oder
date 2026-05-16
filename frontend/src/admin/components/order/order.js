import { useEffect, useMemo, useState } from "react";
import AutoCloseNotification from "../alerts/AutoCloseNotification";
import PaginationHelper from "../../helpers/pagination";
import { formatCurrency, formatDateTime } from "../../../users/utils/shop";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "activating", label: "Activating" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function Order({ query }) {
  const [orders, setOrders] = useState([]);
  const [draftUpdates, setDraftUpdates] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    dineInOrders: 0,
    deliveryOrders: 0,
    totalRevenue: 0,
    totalDeposits: 0,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      params.set("page", String(page));
      params.set("limit", "8");

      const response = await fetch(`/api/admin/checkout/doneOrder?${params.toString()}`, {
        credentials: "include",
      });
      const data = await response.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setPagination(data.pagination || { totalPages: 1, totalItems: 0 });
      setStats(data.stats || stats);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, typeFilter, page]);

  const handleChangeStatus = (orderId, status, orderCode) => {
    setDraftUpdates((prev) => {
      const existingIndex = prev.findIndex((item) => item[0] === orderId);
      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex] = [orderId, status, orderCode];
        return next;
      }
      return [...prev, [orderId, status, orderCode]];
    });

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, orderStatus: status } : order
      )
    );
  };

  const handleApplyUpdates = async () => {
    const response = await fetch("/api/admin/authenOrder", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ orderNew: draftUpdates }),
    });
    const res = await response.json();

    setMessage(res.message);
    setDraftUpdates([]);
    fetchOrders();
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const pendingDrafts = useMemo(() => draftUpdates.length, [draftUpdates]);

  return (
    <>
      {message && <AutoCloseNotification message={message} />}

      <section className="admin-hero-grid">
        <article className="admin-hero-card compact">
          <span className="admin-hero-label">Tong don</span>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className="admin-hero-card compact">
          <span className="admin-hero-label">Cho xu ly</span>
          <strong>{stats.pendingOrders}</strong>
        </article>
        <article className="admin-hero-card compact">
          <span className="admin-hero-label">Dat ban</span>
          <strong>{stats.dineInOrders}</strong>
        </article>
        <article className="admin-hero-card compact">
          <span className="admin-hero-label">Giao hang</span>
          <strong>{stats.deliveryOrders}</strong>
        </article>
      </section>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-actions">
            <select className="admin-select admin-select-inline" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
              <option value="">Tat ca trang thai</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <select className="admin-select admin-select-inline" value={typeFilter} onChange={(e) => { setPage(1); setTypeFilter(e.target.value); }}>
              <option value="">Tat ca loai don</option>
              <option value="dine_in">Dat ban</option>
              <option value="delivery">Giao hang</option>
            </select>
          </div>
          <button className="admin-btn admin-primary" onClick={handleApplyUpdates} disabled={pendingDrafts === 0}>
            Luu {pendingDrafts > 0 ? `(${pendingDrafts})` : ""}
          </button>
        </div>

        <div className="admin-meta-row">
          <span>Doanh thu: {formatCurrency(stats.totalRevenue || 0)}</span>
          <span>Coc dat ban: {formatCurrency(stats.totalDeposits || 0)}</span>
          <span>{pagination.totalItems || 0} don tim thay</span>
        </div>
      </div>

      <div className="admin-card admin-table">
        {loading ? (
          <div className="loading">Dang tai don hang...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Don hang</th>
                  <th>Nha hang</th>
                  <th>Khach hang</th>
                  <th>Loai / Ban</th>
                  <th>Tong tien</th>
                  <th>Coc</th>
                  <th>Thong tin them</th>
                  <th>Ngay tao</th>
                  <th>Trang thai</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.orderId}</strong>
                      <div className="admin-muted">{order.orderGroupCode || "Don le"}</div>
                    </td>
                    <td>
                      <strong>{order.restaurantInfo?.name || "Nha hang"}</strong>
                      <div className="admin-muted">{order.restaurantInfo?.phone || "--"}</div>
                    </td>
                    <td>
                      <strong>{order.userInfo?.fullName || "N/A"}</strong>
                      <div>{order.userInfo?.phone || "N/A"}</div>
                      {order.orderType === "delivery" && (
                        <div className="admin-muted">{order.userInfo?.address || "--"}</div>
                      )}
                    </td>
                    <td>
                      <div>{order.orderType === "delivery" ? "Giao hang" : "Dat ban"}</div>
                      {order.orderType === "dine_in" ? (
                        <div className="admin-muted">
                          {order.tableInfo?.tableNumber || "N/A"} {order.tableInfo?.area ? `- ${order.tableInfo.area}` : ""}
                        </div>
                      ) : (
                        <div className="admin-muted">Ship tai nha</div>
                      )}
                    </td>
                    <td>{formatCurrency(order.totalAmount || 0)}</td>
                    <td>{formatCurrency(order.depositAmount || 0)}</td>
                    <td>
                      {order.orderType === "dine_in" ? (
                        <>
                          <div>{order.tableInfo?.visitDate || "--"} {order.tableInfo?.arrivalTime || ""}</div>
                          {order.relativeContact?.phone ? (
                            <div className="admin-muted">Nguoi than: {order.relativeContact.fullName} - {order.relativeContact.phone}</div>
                          ) : (
                            <div className="admin-muted">Khong co ban thu hai</div>
                          )}
                        </>
                      ) : (
                        <div className="admin-muted">Ship order</div>
                      )}
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <select
                        className="admin-select"
                        value={order.orderStatus}
                        onChange={(e) => handleChangeStatus(order._id, e.target.value, order.orderId)}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <PaginationHelper totalPages={pagination.totalPages || 1} page={page} setPage={setPage} />
          </>
        )}
      </div>
    </>
  );
}

export default Order;
