import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CardProducts from "../mixi/cardProducts/cardProducts";

function ProductCategoryPage() {
  const { slugCategory } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/products/${slugCategory}`)
      .then((res) => res.json())
      .then((products) => setData(Array.isArray(products) ? products : []))
      .catch(() => setData([]));
  }, [slugCategory]);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Danh Mục</p>
          <h2>Món Trong Nhóm {slugCategory}</h2>
        </div>
      </div>
      <CardProducts data={data} />
    </section>
  );
}

export default ProductCategoryPage;
