function Advertisement() {
  const promos = [
    {
      title: "Dat ban nhom nhanh hon",
      description: "Chon khu vuc, so khach va gio den ngay trong luong checkout moi.",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Combo toi uu cho ban an gia dinh",
      description: "Goi y mon noi bat va combo phu hop theo nhu cau order tai quan.",
      image:
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <section className="promo-grid">
      <article className="promo-hero">
        <div className="promo-copy">
          <p className="eyebrow">Khong gian an uong</p>
          <h2>Lam moi trang dat mon theo phong cach nha hang hien dai.</h2>
          <p>
            Giao dien uu tien thao tac nhanh, card mon an ro rang, checkout tach ro dat ban va
            giao hang.
          </p>
          <div className="promo-actions">
            <a href="/products" className="primary-button">
              Xem thuc don
            </a>
            <a href="/cart/checkout?mode=table" className="secondary-button">
              Giu ban toi nay
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
