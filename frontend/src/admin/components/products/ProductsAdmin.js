import { useEffect, useMemo, useState } from "react";
import "../../css/products/ProductsAdmin.css";
import PaginationHelper from "../../helpers/pagination";
import CreatProducts from "../creatProduct/creatProducts";
import EditProducts from "../creatProduct/editPtoducts";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import LoadingCart from "../mixi/loadingCart";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import LoadingButton from "../../../shared/components/LoadingButton";
import useButtonLoading from "../../../shared/hooks/useButtonLoading";
import { formatCurrency } from "../../../users/utils/shop";

const ProductsAdmin = ({ query }) => {
  const navigate = useNavigate();
  const [cardLoading, setCardLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [idEdit, setIdEdit] = useState("");
  const [page, setPage] = useState(1);
  const [sortAim, setSortAim] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [limitPage, setLimitPage] = useState(10);
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [newStatus, setNewStatus] = useState("active");
  const [loadingStatusIds, setLoadingStatusIds] = useState(new Set());
  const { isLoading: isLoadingMulti, handleLoading: handleLoadingMulti } = useButtonLoading();

  const sortAims = [
    { id: 1, value: "price_asc", title: "Giá tăng dần" },
    { id: 2, value: "price_desc", title: "Giá giảm dần" },
    { id: 3, value: "position_asc", title: "Vị trí tăng dần" },
    { id: 4, value: "position_desc", title: "Vị trí giảm dần" },
  ];

  const statusOptions = [
    { id: 1, value: "active", title: "Hoạt động" },
    { id: 2, value: "inactive", title: "Tạm dừng" },
    { id: 3, value: "delete-all", title: "Xoá đã chọn" },
  ];

  const fetchProducts = async () => {
    let url = "/api/admin/products";
    const params = [];

    if (activeTab === "active" || activeTab === "inactive") {
      params.push(`status=${activeTab}`);
    }
    if (query) {
      params.push(`keyword=${encodeURIComponent(query)}`);
    }
    if (page > 1) {
      params.push(`page=${page}`);
    }
    if (restaurantFilter) {
      params.push(`restaurantId=${restaurantFilter}`);
    }
    if (sortAim !== "") {
      const sortValue = sortAim.split("_")[1];
      const sortKey = sortAim.split("_")[0];
      params.push(`sortKey=${sortKey}`);
      params.push(`sortValue=${sortValue}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    try {
      const res = await apiFetch(url);
      setProducts(Array.isArray(res.data) ? res.data : []);
      setRestaurants(Array.isArray(res.restaurants) ? res.restaurants : []);
      setCardLoading(false);
      setTotalPages(res.objPagination?.totalPages || 1);
      setLimitPage(res.objPagination?.limitItems || 10);
    } catch (err) {
      if (err.status === 401) {
        navigate("/admin/auth/login");
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, query, page, sortAim, restaurantFilter]);

  const filteredProducts = useMemo(() => {
    if (!ratingFilter) return products;
    return products.filter((item) => Number(item.restaurantInfo?.ratingAverage || 0) >= Number(ratingFilter));
  }, [products, ratingFilter]);

  const handleChangeStatus = async (id, status) => {
    setLoadingStatusIds((prev) => new Set([...prev, id]));
    const statusChange = status === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`/api/admin/products/change-status/${statusChange}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: statusChange }),
      });
      const result = await res.json();
      await fetchProducts();
      notifyApp(result.message || "Thay đổi trạng thái thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      notifyApp("Cập nhật thất bại!", "error");
    } finally {
      setLoadingStatusIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheck = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpdateChangeMulti = async () => {
    if (!newStatus) {
      notifyApp("Chọn trạng thái", "warning");
      return;
    }
    if (selectedIds.length === 0) {
      notifyApp("Chưa có sản phẩm nào được chọn", "warning");
      return;
    }

    await handleLoadingMulti(async () => {
      try {
        const res = await fetch(`/api/admin/products/change-multi`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ids: selectedIds, newStatus }),
        });
        const data = await res.json();
        await fetchProducts();
        setSelectedIds([]);
        notifyApp(data.message || "Cập nhật thành công!", "success");
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
        notifyApp("Cập nhật thất bại!", "error");
      }
    });
  };

  return (
    <div className="products-page">
      <CreatProducts setProducts={setProducts} setLoading={setCardLoading} />
      <EditProducts idEdit={idEdit} setProducts={setProducts} />

      <section className="admin-grid admin-grid-4">
        <div className="admin-card">
          <h3>Tổng sản phẩm</h3>
          <div className="admin-big">{filteredProducts.length}</div>
        </div>
        <div className="admin-card">
          <h3>Đang bán</h3>
          <div className="admin-big">{filteredProducts.filter((item) => item.status === "active").length}</div>
        </div>
        <div className="admin-card">
          <h3>Cửa hàng</h3>
          <div className="admin-big">{restaurants.length}</div>
        </div>
        <div className="admin-card">
          <h3>Lượt chọn</h3>
          <div className="admin-big">{selectedIds.length}</div>
        </div>
      </section>

      <header className="products-header">
        <h1>Tất cả sản phẩm từ các cửa hàng</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className={`admin-btn ${activeTab === "all" ? "admin-primary" : ""}`} onClick={() => { setPage(1); setActiveTab("all"); }}>
            Tất cả
          </button>
          <button className={`admin-btn ${activeTab === "active" ? "admin-primary" : ""}`} onClick={() => { setPage(1); setActiveTab("active"); }}>
            Hoạt động
          </button>
          <button className={`admin-btn ${activeTab === "inactive" ? "admin-primary" : ""}`} onClick={() => { setPage(1); setActiveTab("inactive"); }}>
            Tạm dừng
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select
            name="sort"
            className="admin-select"
            style={{ width: "180px" }}
            value={sortAim}
            onChange={(e) => setSortAim(e.target.value)}
          >
            <option value="">Sắp xếp</option>
            {sortAims.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            style={{ width: "220px" }}
            value={restaurantFilter}
            onChange={(e) => { setPage(1); setRestaurantFilter(e.target.value); }}
          >
            <option value="">Lọc theo cửa hàng</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            style={{ width: "180px" }}
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">Lọc theo rating</option>
            <option value="4">Từ 4 sao</option>
            <option value="4.5">Từ 4.5 sao</option>
          </select>

          <button className="btn-accent" onClick={() => { setSortAim(""); setRestaurantFilter(""); setRatingFilter(""); }}>
            Xoá lọc
          </button>

          <button className="btn-accent" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop">
            + Thêm sản phẩm
          </button>
        </div>
      </header>

      <div className="products-header">
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            name="status"
            className="admin-select"
            style={{ width: "180px" }}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </select>

          <LoadingButton
            className="btn-accent"
            onClick={handleUpdateChangeMulti}
            isLoading={isLoadingMulti}
            loadingText="Đang xử lý..."
            variant="primary"
          >
            Áp dụng
          </LoadingButton>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  name="checkall"
                  onChange={handleCheckAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                />
              </th>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Cửa hàng</th>
              <th>Rating</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cardLoading ? (
              <LoadingCart />
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <tr key={item._id}>
                  <td>
                    <input
                      type="checkbox"
                      name="id"
                      checked={selectedIds.includes(item._id)}
                      onChange={() => handleCheck(item._id)}
                    />
                  </td>
                  <td>{limitPage * (page - 1) + (index + 1)}</td>
                  <td>
                    <img src={item.img} alt={item.name} className="storyHome-img" />
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="admin-muted">{item.category || "Chưa phân loại"}</div>
                  </td>
                  <td>{item.restaurantInfo?.name || "Chưa gán cửa hàng"}</td>
                  <td>{Number(item.restaurantInfo?.ratingAverage || 0).toFixed(1)} / 5</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>
                    <LoadingButton
                      onClick={() => handleChangeStatus(item._id, item.status)}
                      isLoading={loadingStatusIds.has(item._id)}
                      loadingText="..."
                      variant="ghost"
                      style={{
                        color: item.status === "active" ? "green" : "red",
                        padding: "4px 8px",
                      }}
                    >
                      {item.status === "active" ? "Hoạt động" : "Tạm dừng"}
                    </LoadingButton>
                  </td>
                  <td style={{ display: "flex", gap: "5px" }}>
                    <button
                      className="admin-btn"
                      type="button"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#offcanvasEditProduct"
                      aria-controls="offcanvasEditProduct"
                      onClick={() => setIdEdit(item._id)}
                    >
                      <i className="bi bi-pen"></i>
                    </button>
                    <button
                      className="admin-btn"
                      onClick={async () => {
                        await fetch(`/api/admin/products/delete/${item._id}`, { method: "DELETE", credentials: "include" });
                        fetchProducts();
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  Không có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationHelper totalPages={totalPages} page={page} setPage={setPage} />
    </div>
  );
};

export default ProductsAdmin;
