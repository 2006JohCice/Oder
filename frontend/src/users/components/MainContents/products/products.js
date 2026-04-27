import { useEffect, useMemo, useState } from "react";
import CardProducts from "../../mixi/cardProducts/cardProducts";

function Products() {
  const [productsData, setProductsData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProductsData(Array.isArray(data) ? data : []))
      .catch(() => setProductsData([]));
  }, []);

  const filters = useMemo(() => {
    const names = new Set();
    productsData.forEach((product) => {
      if (product.categoryName) names.add(product.categoryName);
    });
    return ["all", ...Array.from(names).slice(0, 5)];
  }, [productsData]);

  const visibleProducts = useMemo(() => {
    if (activeFilter === "all") return productsData;
    return productsData.filter((product) => product.categoryName === activeFilter);
  }, [activeFilter, productsData]);

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Toàn Bộ Thực Đơn</p>
        </div>
      </div>

      <div className="chip-row">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`chip ${activeFilter === filter ? "active" : ""}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === "all" ? "Tat ca" : filter}
          </button>
        ))}
      </div>

      <CardProducts data={visibleProducts} />
    </section>
  );
}

export default Products;
