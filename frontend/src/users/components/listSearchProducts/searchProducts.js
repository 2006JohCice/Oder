import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CardProducts from "../mixi/cardProducts/cardProducts";

function SearchProduct() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search${location.search}`)
      .then((res) => res.json())
      .then((resData) => setData(Array.isArray(resData) ? resData : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [location.search]);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Kết quả tìm kiếm</p>
          <h2>{searchParams.get("keyword") || "Tất cả sản phẩm"}</h2>
        </div>
        <p style={{color: '#718096', fontSize: '14px', marginTop: '10px'}}>
          Khu vực: <strong>{searchParams.get("location") || "Tất cả"}</strong> | 
          Giá: <strong>{searchParams.get("price") || "Tất cả"}</strong> | 
          Bữa ăn: <strong>{searchParams.get("meal") || "Tất cả"}</strong>
        </p>
      </div>
      <CardProducts data={data} loading={loading} />
    </section>
  );
}

export default SearchProduct;
