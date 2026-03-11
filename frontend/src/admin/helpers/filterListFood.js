import { useState ,useEffect} from "react";


function FilterListFood({ activeTab, onTabClick }) {
    const [listNameFood, setListNameFood] = useState([
        
    ]);

    const apiListFood = () => {
        fetch("/api/admin/category")
            .then((res) => res.json())
            .then((data) => {
                setListNameFood(data);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy danh mục món ăn:", err);
            });
    }
 

    useEffect(() => {
        apiListFood()
    }, [])


    return (
        <div style={{ display: "flex", gap: "10px" }}>
              <button
                    onClick={() => onTabClick(null, null)}
                    className={`admin-btn ${activeTab === null ? "admin-primary" : ""}`}
                >
                    Tất cả
                </button>
            {listNameFood.map((item) => (
                <button
                    key={item._id}
                    className={`admin-btn ${activeTab === item._id ? "admin-primary" : ""}`}
                    onClick={() => onTabClick(item._id, item._id)}
                >
                    {item.name}
                </button>
            ))}
        </div>
    );
}

export default FilterListFood;