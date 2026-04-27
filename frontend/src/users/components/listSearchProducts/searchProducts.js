import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CardProducts from "../mixi/cardProducts/cardProducts";

function SearchProduct() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    fetch(`/api/search/${location.search}`)
      .then((res) => res.json())
      .then((resData) => setData(Array.isArray(resData) ? resData : []))
      .catch(() => setData([]));
  }, [location.search]);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ket qua tim kiem</p>
          <h2>{searchParams.get("keyword") || "Bo loc hien tai"}</h2>
        </div>
        <p>
          Khu vuc: {searchParams.get("location") || "Tat ca"} | Gia:{" "}
          {searchParams.get("price") || "Tat ca"} | Bua an: {searchParams.get("meal") || "Tat ca"}
        </p>
      </div>
      <CardProducts data={data} />
    </section>
  );
}

export default SearchProduct;
