import { useEffect, useState } from "react";
import CardProducts from "../../mixi/cardProducts/cardProducts";

function ProductsList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => setData(Array.isArray(products) ? products : []))
      .catch(() => setData([]));
  }, []);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Danh Sách</p>
          <h2>Toàn Bộ Món Ăn Đang Phục Vụ</h2>
        </div>
      </div>
      <CardProducts data={data} />
    </section>
  );
}

export default ProductsList;
