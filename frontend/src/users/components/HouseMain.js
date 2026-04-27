import "../css/MainContent.css";
import Advertisement from "./MainContents/Advertisement/Advertisement";
import FeaturedProducts from "./MainContents/products/featuredProducts";
import Products from "./MainContents/products/products";

function MainContent() {
  return (
    <div className="page-stack">
      <section className="hero-metrics">
        <article>
          <strong>120+</strong>
          <span>Món Ăn Đang Chờ Phục Vụ</span>
        </article>
        <article>
          <strong>15 phút</strong>
          <span>Thời gian lên đơn trung bình</span>
        </article>
        <article>
          <strong>Hơn 20 bàn </strong>
          <span>Khu vực rộng rải</span>
        </article>
      </section>

      <Advertisement />
      <FeaturedProducts />
      <Products />
    </div>
  );
}

export default MainContent;
