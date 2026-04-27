function Advertisement() {
  const promos = [
    {
      title: "Đặt Bàn Nhanh Hơn",
      description: "Chọn khu vực, số khách giỏ hàng đến ngay trong lượt checkout mới.",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Combo tối ưu cho gia đình bạn",
      description: "Món ăn gia đình oredr ngay tại đây.",
      image:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <section className="promo-grid">
      <article className="promo-hero">
        <div className="promo-copy">
          <p className="eyebrow">Không gian ăn uống</p>
          <h2>Sạch Sẽ, Sang Trọng.</h2>
          <p>
            Đặt nhanh, card món ăn rõ ràng, checkout nhanh chóng đặt bàn & giao hàng tức thì.
          </p>
          <div className="promo-actions">
            <a href="/products" className="primary-button no-underline ">
              Xem Thực Đơn
            </a>
            <a href="/cart/checkout?mode=table" className="secondary-button no-underline" style ={{color:"black"}}>
              Giữ Bàn Ngay
            </a>
          </div>
        </div>
      </article>

      <div className="promo-aside">
        {promos.map((promo) => (
          <article key={promo.title} className="promo-card">
            <img src={promo.image} alt={promo.title} />
            <div>
              <h3>{promo.title}</h3>
              <p>{promo.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Advertisement;
