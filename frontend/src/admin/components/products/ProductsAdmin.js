import { useState, useEffect } from "react";
import "../../css/products/ProductsAdmin.css";
import ButtonTabs from "../../helpers/filterStatus";
import FilterListFood from "../../helpers/filterListFood";
import PaginationHelper from "../../helpers/pagination";
import Delete from "../../helpers/delete";
import CreatProducts from "../creatProduct/creatProducts";
import EditProducts from "../creatProduct/editPtoducts";
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../../utils/apiFetch';
import LoadingCart from "../mixi/loadingCart";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import LoadingButton from "../../../shared/components/LoadingButton";
import useButtonLoading from "../../../shared/hooks/useButtonLoading";

const ProductsAdmin = ({ query }) => {
  const [CardLoading ,setCardLoading] = useState(true);
  const navigate = useNavigate();
  // console.log("Query in ProductsAdmin:", query);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(1); // mặc định là "All"
  const [activeName, setActiveName] = useState(1); // mặc định là "All"
  const [loading, setLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [idDelete, setIdDelete] = useState("");
  const [idEdit, setIdEdit] = useState("");

  const [page, setPage] = useState(1);
  const [sortAim, setSortAim] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [limitPage, setLimitPage] = useState(10);
  const [newStatusListFood, setNewStatusListFood] = useState("");
  const [notifKey, setNotifKey] = useState(0);

  // Loading states for buttons
  const [loadingStatusIds, setLoadingStatusIds] = useState(new Set());
  const { isLoading: isLoadingMulti, handleLoading: handleLoadingMulti } = useButtonLoading();

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: query || "",
  });


  const fetchProducts = (status, category) => {

    let url = "/api/admin/products";
    const params = [];
    if (status) {
      params.push(`status=${status}`);
    }
    if (query) {
      params.push(`keyword=${query}`);
    }

    if (page > 1) {
      params.push(`page=${page}`);
    }
    if (category) {
      params.push(`category=${category}`)
    }
    if (sortAim !== "") {
      let sortValue = sortAim.split("_")[1];
      let sortKey = sortAim.split("_")[0];

      params.push(`sortKey=${sortKey}`);
      params.push(`sortValue=${sortValue}`);

    }


    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }




    apiFetch(url)
      // .then((res) => res.json())
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
        setCardLoading(false)
        setTotalPages(res.objPagination.totalPages)
        setLimitPage(res.objPagination.limitItems)
      })
      .catch(err => {
        if (err.status === 401) {
          navigate('/admin/auth/login');
        }
        // if (err.status === 200) {
        //   navigate('/admin');
        // }
      });
  };


  useEffect(() => {
    let status = "";
    let category = "";

    // tab → xác định trạng thái
    if (activeTab === 2) status = "active";
    else if (activeTab === 3) status = "inactive";

    if (newStatusListFood === "") {
      category = "";

    } else {
      category = newStatusListFood;
    }




    fetchProducts(status, category);
  }, [activeTab, activeName, query, page, idDelete, sortAim]);


  // Change status
  const handleChangeStatus = async (id, status) => {
    setLoadingStatusIds(prev => new Set([...prev, id]));
    setNotifMessage("Thay Đổi Trạng Thái Thành Công!")
    setNotifKey((prev) => prev + 1);

    const statusChange = status === "active" ? "inactive" : "active";

    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, status: statusChange } : p
      )
    );

    const url = `/api/admin/products/change-status/${statusChange}/${id}`;

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusChange }),
      });
      const result = await res.json();
      console.log("Cập nhật xong:", result);
      await fetchProducts();
      notifyApp("Thay đổi trạng thái thành công!", "success");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      notifyApp("Cập nhật thất bại!", "error");
    } finally {
      setLoadingStatusIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };




  // option 
  const statusOptions = [

    { id: 1, value: "active" },
    { id: 2, value: "inactive" },
    { id: 3, value: "delete-all" },
    { id: 4, value: "change-position" }

  ];


  const sortAims = [
    { id: 1, value: "price_asc", title: "Giá Tăng Dần" },
    { id: 2, value: "price_desc", title: "Giá Giảm Dần" },
    { id: 3, value: "position_asc", title: "Vị Trí Tăng Dân" },
    { id: 4, value: "position_desc", title: "Vị Trí Giảm Dần" },
  ]

  // Change-multi



  const [selectedIds, setSelectedIds] = useState([]);
  const [newStatus, setNewStatus] = useState("active");



  // console.log(newStatus)
  /*-------Check all----- */
  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products?.map((item) => item._id))

    } else {
      setSelectedIds([])
    }
  }
  

  /* Change position */
  const [idPosition, setIdPosition] = useState([])

  const handleChangePosition = (index, e) => {
    const value = e.target.value
    const updatePosition = [...products]

    updatePosition[index].position = value


    setProducts(updatePosition)



    // lấy ra item vừa thay đổi
    const changedItem = updatePosition[index]
    // console.log(changedItem)


    setIdPosition((prev) => {
      const filtered = prev.filter(p => p.id !== changedItem._id);

      return [...filtered, { id: changedItem._id, position: value }];
    })


  }


  /*Endl Change position */





  /*-------Check one----- */





  const handleCheck = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleUpdateChangeMulti = async () => {
    /* Xóa nhiều sản phẩm */
    if (newStatus === "delete-all") {
      // eslint-disable-next-line no-restricted-globals
      const result = confirm("Bạn có chắc chắn");
      if (!result) {
        return
      }
    }

    if (newStatus === "change-position") {
      // eslint-disable-next-line no-restricted-globals
      const result = confirm("Bạn có chắc chắn");
      if (!result) {
        return
      }
    }

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
          body: JSON.stringify({ ids: selectedIds, idPosition, newStatus }),
        });
        const data = await res.json();
        setNotifMessage(data.message);
        await fetchProducts();
        notifyApp(data.message || "Cập nhật thành công!", "success");
        setSelectedIds([]);
        setIdPosition([]);
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
        notifyApp("Cập nhật thất bại!", "error");
      }
    });
  };
  //Endl change-multi


  return (
    <div className="products-page">
      <CreatProducts setProducts={setProducts} setLoading={setLoading} />
      <EditProducts idEdit={idEdit} setProducts={setProducts} />

      <header className="products-header">
        <h1>Quản Trị Sản Phẩm</h1>
        <div >

          <ButtonTabs
            activeTab={activeTab}
            onTabClick={(tab) => setActiveTab(tab.id)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            name="status"
            className="admin-select"
            style={{ width: "230px" }}
            value={sortAim}
            onChange={(e) => setSortAim(e.target.value)}
          >
            {sortAims?.map((opt) => (
              <option key={opt.id} value={opt.value} >
                {opt.title}
              </option>
            ))}
          </select>
          <LoadingButton 
            className="btn-accent" 
            onClick={() => setSortAim("")}
            variant="secondary"
          >
            Xóa Lọc
          </LoadingButton>

          <button className="btn-accent" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBackdrop" aria-controls="offcanvasWithBackdrop">
            + Thêm Sản Phẩm
          </button>

        </div>


      </header>

      <div className="products-header">
        <FilterListFood
          activeTab={activeName}
          onTabClick={(category, tab) => {
            setNewStatusListFood(category)
            setActiveName(tab)
          }}
        />

        <div style={{ display: "flex", gap: "10px" }}>

          <select
            name="status"
            className="admin-select"
            style={{ width: "130px" }}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {statusOptions?.map((opt) => (
              <option key={opt.id} value={opt.value} >
                {opt.value}
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
            Áp Dụng
          </LoadingButton>

        </div>


      </div>
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th><input
                type="checkbox"
                name="checkall"
                onChange={handleCheckAll}
                checked={selectedIds.length === products.length}
              /></th>

              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên Sản Phẩm</th>
              <th>Giá (VNĐ)</th>
              <th>Trạng Thái</th>
              <th>Vị Trí</th>
              <th>Tồn Kho</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {
              CardLoading ? (
               
                    <LoadingCart />
                
              ) : (
                products.length > 0 ? (
                  Array.isArray(products) && products.map((item, index) => (
                    <tr key={item._id}>
                      <td><input
                        type="checkbox"
                        name="id"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleCheck(item._id)}
                      /></td>

                      <td>{limitPage * (page - 1) + (index + 1)}</td>
                      <td>
                        <img
                          src={item.img}
                          alt={item.name}
                          className="storyHome-img"
                        /></td>
                      <td>{item.name}</td>
                      <td>{item.price.toLocaleString()}</td>
                      <td>
                        <LoadingButton
                          onClick={() => handleChangeStatus(item._id, item.status)}
                          isLoading={loadingStatusIds.has(item._id)}
                          loadingText={item.status === "active" ? "..." : "..."}
                          variant="ghost"
                          style={{ 
                            color: item.status === "active" ? "green" : "red",
                            padding: "4px 8px"
                          }}
                        >
                          {item.status === "active" ? "Hoạt Động" : "Ngừng Bán"}
                        </LoadingButton>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.position}
                          style={{ width: "60px" }}
                          min="1"
                          name="position"
                          onChange={(e) => handleChangePosition(index, e)}
                        />
                      </td>
                      <td>{item.stock}</td>
                      <td style={{ display: "flex", gap: "5px" }}>
                        <button className="admin-btn"
                          type="button"
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasEditProduct"
                          aria-controls="offcanvasEditProduct"
                          onClick={() => setIdEdit(item._id)}

                        ><i className="bi bi-pen"></i></button>
                        <Delete set={setProducts} Id={item._id} setId={setIdDelete} setLoading={setLoading} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      Không có dữ liệu sản phẩm.
                    </td>
                  </tr>
                )
              )
            }
          </tbody>
        </table>
      </div>
      <PaginationHelper totalPages={totalPages} page={page} setPage={setPage} />

    </div>
  );
};

export default ProductsAdmin;
