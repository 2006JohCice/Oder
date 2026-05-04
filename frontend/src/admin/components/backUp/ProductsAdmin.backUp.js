/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useState, useEffect } from "react";
import "../../css/products/ProductsAdmin.css";
import PaginationHelper from "../../helpers/pagination";
import AutoCloseNotification from "../alerts/AutoCloseNotification";
import Delete from "../../helpers/delete";
import CreatProducts from "../creatProduct/creatProducts";
import EditProducts from "../creatProduct/editPtoducts";
import { apiFetch } from '../../../utils/apiFetch';
import { useNavigate } from 'react-router-dom';
const ProductsBackUp = ({ query }) => {
    const navigate = useNavigate();
    // console.log("Query in ProductsAdmin:", query);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState(1); // mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh lÃƒÂ  "All"
    const [activeName, setActiveName] = useState(1); // mÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh lÃƒÂ  "All"
    const [loading, setLoading] = useState();
    const [notifMessage, setNotifMessage] = useState("");
    const [idDelete, setIdDelete] = useState("");
    const [idEdit, setIdEdit] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [tab, setTab] = useState(1)
    const [idCategory, setIdCategory] = useState([])
    // XÃ¡Â»Â­ lÃƒÂ½ phÃ¡ÂºÂ§n frontend vÃ¡Â»Â thÃƒÂ´ng bÃƒÂ¡o thÃƒÂ¬ nÃƒÂ³ Ã¡Â»Å¸ phÃ¡ÂºÂ§n loading vÃƒÂ  notifi Ã„â€˜Ã¡Â»Æ’ xÃ†Â° lÃƒÂ½
    console.log(products)


    const [notifKey, setNotifKey] = useState(0);


    const fetchProductsBackUp = () => {
        fetch("/api/admin/category")
            .then(res => res.json())
            .then(data => {
                setIdCategory(data)
            })


        apiFetch("/api/admin/backup/products")
            // .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data.backUpProductsData) ? data.backUpProductsData : []);
                setTotalPages(data.objPagination.totalPages);
            })
            .catch(err => {
               if (err.status === 401) {
                   navigate('/admin/auth/login');
               }

            });
    };

    useEffect(() => {
        fetchProductsBackUp();
    }, []);

    // console.log("Idcategory",idCategory)

    const handlBackUp = async (id, status) => {

        const url = `/api/admin/backup/products/${status}/${id}`;

        try {
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.success) {
                fetchProductsBackUp();
                setLoading(true);
                setNotifMessage(data.message);
            } else {
                alert(data.message || "CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!");
            }

        } catch (error) {
            console.error(error);
            alert("CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!");
        }
    };

    const handlDelete = async (id) =>{
        
        const url = `/api/admin/backup/products/delete/${id}`;
        
        try {
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.success) {
                fetchProductsBackUp();
                setLoading(true);
                setNotifMessage(data.message);
            } else {
                alert(data.message || "CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!");
            }

        } catch (error) {
            console.error(error);
            alert("CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!");
        }
    }




    // option 
    const statusOptions = [
        { id: 1, value: "Delete" },
        { id: 2, value: "KhÃƒÂ´i PhÃ¡Â»Â¥c" },

    ];

    const buttonTabs = [
        { id: 1, title: "Products", value: "" },
        { id: 2, title: "User", value: "User" },

    ];



    // Change-multi



    const [selectedIds, setSelectedIds] = useState([]);
    const [newStatus, setNewStatus] = useState("active");



    // console.log(newStatus)
    /*-------Check all----- */
    const handleCheckAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(products.map((item) => item._id))

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



        // lÃ¡ÂºÂ¥y ra item vÃ¡Â»Â«a thay Ã„â€˜Ã¡Â»â€¢i
        const changedItem = updatePosition[index]
        // console.log(changedItem)


        setIdPosition((prev) => {
            const filtered = prev.filter(p => p.id !== changedItem._id);

            return [...filtered, { id: changedItem._id, position: value }];
        })


    }


    /*Endl Change position */






    const handleCheck = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const handleUpdateChangeMulti = async () => {


        /* XÃƒÂ³a nhiÃ¡Â»Âu sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m */
        if (newStatus === "delete-all") {
            // eslint-disable-next-line no-restricted-globals
            const result = confirm("BÃ¡ÂºÂ¡n cÃƒÂ³ chÃ¡ÂºÂ¯c chÃ¡ÂºÂ¯n");
            if (!result) {
                return
            }
        }

        if (newStatus === "change-position") {
            // eslint-disable-next-line no-restricted-globals
            const result = confirm("BÃ¡ÂºÂ¡n cÃƒÂ³ chÃ¡ÂºÂ¯c chÃ¡ÂºÂ¯n");
            if (!result) {
                return
            }
        }


        if (!newStatus) {
            alert("ChÃ¡Â»Ân trÃ¡ÂºÂ¡ng thÃƒÂ¡i")
        }
        if (selectedIds.length === 0) return alert("chÃ†Â°a cÃƒÂ³ sÃ¡ÂºÂ£n phÃ¡ÂºÂ©m nÃƒÂ o Ã„â€˜Ã†Â°Ã¡Â»Â£c chÃ¡Â»Ân")


        fetch(`/api/admin/products/change-multi`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: selectedIds, idPosition, newStatus }),
        })
            .then(res => res.json())
            .then(data => {
                setNotifMessage(data.message)
                setLoading(true);

            })
            .catch(err => {
                console.error("LÃ¡Â»â€”i khi cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t:", err);
                alert("CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i!");
            })
    }
    //Endl change-multi


    console.log("category", idCategory)

    return (
        <div className="products-page">
            <CreatProducts setProducts={setProducts} setNotifMessage={setNotifMessage}
                setLoading={setLoading} />

            <EditProducts idEdit={idEdit} setProducts={setProducts} />
            {loading && (<AutoCloseNotification
                key={notifKey}
                message={notifMessage}
                onClose={() => setLoading(false)}
            />)}

            <header className="products-header">
                <h1>KhÃƒÂ´i PhÃ¡Â»Â¥c</h1>
                <div >
                    <div style={{ display: "flex", gap: "10px" }}>
                        {buttonTabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`admin-btn ${activeTab === tab.id ? "admin-primary" : ""}`}
                                onClick={() => { setActiveTab(tab.id); }}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>

                    <select
                        name="status"
                        className="admin-select"
                        style={{ width: "130px" }}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.id} value={opt.value} >
                                {opt.value}
                            </option>
                        ))}


                    </select>

                    <button className="btn-accent" onClick={handleUpdateChangeMulti}>ÃƒÂp DÃ¡Â»Â¥ng</button>

                </div>

            </header>

            <div className="products-header">





            </div>
            <div className="products-table">
                <table>
                    <thead>
                        <tr>
                            <th><input
                                type="checkbox"
                                name="checkall"
                                onChange={handleCheckAll}
                            // checked={selectedIds.length === products.length}
                            /></th>

                            <th>ID</th>
                            <th>Ã¡ÂºÂ¢nh</th>
                            <th>TÃƒÂªn SÃ¡ÂºÂ£n PhÃ¡ÂºÂ©m</th>
                            <th>GiÃƒÂ¡ (VNÃ„Â)</th>
                            <th>LoÃ¡ÂºÂ¡i Ã„ÂÃ¡Â»â€œ Ã„â€šn</th>
                            <th>HÃƒÂ nh Ã„ÂÃ¡Â»â„¢ng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((item, index) => (
                            <tr key={item._id}>
                                <td><input
                                    type="checkbox"
                                    name="id"
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => handleCheck(item._id)}
                                /></td>

                                <td>{index + 1}</td>
                                <td>
                                    <img
                                        src={item.img}
                                        alt={item.name}
                                        className="storyHome-img"
                                    /></td>
                                <td>{item.name}</td>
                                <td>{item.price.toLocaleString()}</td>

                                <td style={{ color: "red" }}>
                                    <a
                                        style={{ cursor: "pointer" }}
                                        data-status={item.status}
                                        data-id={item.id}
                                    >

                                        {item.category}
                                    </a>
                                </td>



                                <td style={{ display: "flex", gap: "5px" }}>
                                    <button className="admin-btn" class="admin-btn"
                                        onClick={() => handlBackUp(item._id, 'back')}
                                    ><i class="bi bi-arrow-left-right"></i></button>

                                    <button className="admin-btn" class="admin-btn"
                                      onClick={() => handlDelete(item._id)}
                                    ><i className="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationHelper totalPages={totalPages} page={page} setPage={setPage} />

        </div>
    );
};

export default ProductsBackUp;
