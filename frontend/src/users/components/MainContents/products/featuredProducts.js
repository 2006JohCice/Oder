import { useEffect, useState } from "react";
import CardProducts from "../../mixi/cardProducts/cardProducts";

function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    fetch("/api/products/featured")
      .then((res) => res.json())
      .then((res) => {
        setFeatured(res.data || []);
        setLatest(res.dataProductsNew || []);
      })
      .catch(() => {
        setFeatured([]);
        setLatest([]);
      });
  }, []);

  return (
    <section className="page-stack">
      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Món Ăn Được Gọi Nhiều Nhất</p>
            <h2>Lựa Chọn Nổi Bật</h2>
          </div>
          <p>Card giá ngon hơn, nhan giá rõ ràng , thao tác nhanh hơnn.</p>
        </div>
        <CardProducts data={featured} />
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mới Cập Nhật</p>
            <h2>Món mới trong thực đơn</h2>
          </div>
        </div>
        <CardProducts data={latest} />
      </section>
    </section>
  );
}

export default FeaturedProducts;
