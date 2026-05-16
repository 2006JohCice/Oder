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
          <span>Mon an dang san sang tu nhieu nha hang</span>
        </article>
        <article>
          <strong>15 phut</strong>
          <span>Thoi gian len don trung binh</span>
        </article>
        <article>
          <strong>Da nha hang</strong>
          <span>Dat ship va dat ban theo tung nha hang trong cung mot lan checkout</span>
        </article>
      </section>

      <Advertisement />
      <FeaturedProducts />
      <Products />
    </div>
  );
}

export default MainContent;
