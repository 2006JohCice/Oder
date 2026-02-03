import { useState, useEffect } from "react";
import "../../css/creatProduct/CreateProducts.css";
import ListCategory from "../AddCategory/list-category"
function EditProducts({ idEdit, setProducts }) {
    const [dataEdit, setDataEdit] = useState({
        name: "",
        description: "",
        price: "",
        discountPercentage: "",
        stock: "",
        img: "",
        position: "",
        status: "inactive",
        category: "",
        featured:"0"
    });

    useEffect(() => {
        fetch("/api/admin/products/create")
            .then(res => res.json())
            .then(res => {
                // Nếu res là mảng thì set, nếu là object thì lấy res.data hoặc []
                setData(Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []));
            })
            .catch(() => setData([]));
    }, []);

    const [data, setData] = useState([]);

    useEffect(() => {
        if (!idEdit) return;
        fetch(`/api/admin/products/edit/${idEdit}`)
            .then((res) => res.json())
            .then((data) => {

                setDataEdit({
                    name: data.product.name,
                    description: data.product.description,
                    price: data.product.price,
                    discountPercentage: data.product.discountPercentage,
                    stock: data.product.stock,
                    img: data.product.img,
                    position: data.product.position,
                    status: data.product.status,
                    featured:data.product.featured
                });
               
            });
    }, [idEdit]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataEdit((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- Gửi dữ liệu cập nhật ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/products/edit/${idEdit}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataEdit),
            });

            if (res.ok) {
                setProducts(prevProducts => prevProducts.map(product =>
                    product._id === idEdit ? { ...product, ...dataEdit } : product
                ));
                alert("Cập nhật sản phẩm thành công!");
            } else {
                alert("Lỗi khi cập nhật sản phẩm!");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            className="offcanvas offcanvas-start createProducts-offcanvas"
            tabIndex="-1"
            id="offcanvasEditProduct"
            aria-labelledby="offcanvasEditProductLabel"
        >
            <div className="offcanvas-header createProducts-header">
                <h5 className="offcanvas-title" id="offcanvasEditProductLabel">
                    Sửa sản phẩm
                </h5>
                <button
                    type="button"
                    className="btn-close btn-close-white"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>

            <div className="offcanvas-body createProducts-body">
                <form onSubmit={handleSubmit}>
                    {/* Tiêu đề */}
                    <div className="mb-3">
                        <label className="form-label">Tiêu đề</label>
                        <input
                            type="text"
                            name="name"
                            value={dataEdit.name}
                            onChange={handleChange}
                            className="form-control createProducts-input"
                            placeholder="Nhập tiêu đề..."
                            required
                        />
                    </div>

                    <select
                        name="category"
                        className="admin-select"
                        style={{ width: "100%" }}
                        value={dataEdit.category}
                        onChange={handleChange}
                    >
                        <option value="">Lựa chọn của bạn</option>
                        {Array.isArray(data) && data.map(item => (
                            <ListCategory key={item._id} node={item} />
                        ))}
                    </select>
                    
                    <div className="mb-3">
                        <label className="form-label">Cài đặt hiển thị </label>
                        <div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="featured"
                                    value="1"
                                    checked={dataEdit.featured === "1"}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label">Nổi Bật</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="featured"
                                    value="0"
                                    checked={dataEdit.featured === "0"}
                                    onChange={handleChange}

                                />
                                <label className="form-check-label">Không Nổi Bật</label>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="mb-3">
                        <label className="form-label">Mô tả</label>
                        <textarea
                            name="description"
                            value={dataEdit.description}
                            onChange={handleChange}
                            className="form-control createProducts-input"
                            rows="3"
                            placeholder="Nhập mô tả..."
                        ></textarea>
                    </div>

                    {/* Giá & Giảm giá */}
                    <div className="row">
                        <div className="col-6 mb-3">
                            <label className="form-label">Giá</label>
                            <input
                                type="number"
                                name="price"
                                value={dataEdit.price}
                                onChange={handleChange}
                                className="form-control createProducts-input"
                                placeholder="Giá gốc"
                                required
                                min="1"
                            />
                        </div>
                        <div className="col-6 mb-3">
                            <label className="form-label">Giảm giá (%)</label>
                            <input
                                type="number"
                                name="discountPercentage"
                                value={dataEdit.discountPercentage}
                                onChange={handleChange}
                                className="form-control createProducts-input"
                                placeholder="Giảm giá"
                            />
                        </div>
                    </div>

                    {/* Số lượng */}
                    <div className="mb-3">
                        <label className="form-label">Số lượng</label>
                        <input
                            type="number"
                            name="stock"
                            value={dataEdit.stock}
                            onChange={handleChange}
                            className="form-control createProducts-input"
                            placeholder="Nhập số lượng"
                            required
                            min="1"
                        />
                    </div>

                    {/* Ảnh */}
                    <div className="mb-3">
                        <label className="form-label">Ảnh (URL)</label>
                        <input
                            type="url"
                            name="img"
                            value={dataEdit.img}
                            onChange={handleChange}
                            className="form-control createProducts-input"
                            placeholder="Dán link ảnh vào đây..."
                            required
                        />
                    </div>

                    {/* Vị trí */}
                    <div className="mb-3">
                        <label className="form-label">Vị trí</label>
                        <input
                            type="number"
                            name="position"
                            value={dataEdit.position}
                            onChange={handleChange}
                            className="form-control createProducts-input"
                            placeholder="Nhập vị trí hiển thị"
                        />
                    </div>

                    {/* Trạng thái */}
                    <div className="mb-3">
                        <label className="form-label">Trạng thái</label>
                        <div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={dataEdit.status === "active"}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label">Hoạt động</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    checked={dataEdit.status === "inactive"}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label">Dừng hoạt động</label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn createProducts-btn">
                        Lưu thay đổi
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditProducts;