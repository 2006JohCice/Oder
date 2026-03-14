import '../../../css/MainContent/products.css'
import '../../../css/MainContent/cartMiniProducts.css'
import { useState, useEffect } from 'react';
import CardLoading from '../../mixi/CardLoading';
import CardProducts from '../../mixi/cardProducts/cardProducts';

function Products() {

  const [productsData, setProductsData] = useState([]);
  const [cart, setCart] = useState([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [loadCard, setLoadingCart] = useState(true);

  // Load sản phẩm
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data =>{
        setProductsData(data)
        setLoadingCart(false)

      } )
      .catch(() => setProductsData([]));
  }, []);

  // Thêm vào giỏ
  const addToCart = (product) => {
    const exists = cart.find(item => item._id === product._id);
    if (!exists) {
      setCart([...cart, { ...product, quantity: 1 }]);
    } else {
      setCart(
        cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    }
  };

  const sumProducts = cart.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  // Cart actions
  const removeItem = (_id) => setCart(cart.filter(i => i._id !== _id));
  const addQty = (_id) =>
    setCart(cart.map(i => i._id === _id ? { ...i, quantity: i.quantity + 1 } : i));
  const subQty = (_id) =>
    setCart(
      cart.map(i => i._id === _id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );

  // Drag cart
  useEffect(() => {
    const div = document.getElementById("draggable-div");
    if (!div) return;

    let isDragging = false, offsetX = 0, offsetY = 0;

    const down = (e) => {
      isDragging = true;
      offsetX = e.clientX - div.offsetLeft;
      offsetY = e.clientY - div.offsetTop;
      div.style.cursor = "grabbing";
    };

    const move = (e) => {
      if (!isDragging) return;
      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      x = Math.max(0, Math.min(window.innerWidth - div.offsetWidth, x));
      y = Math.max(0, Math.min(window.innerHeight - div.offsetHeight, y));

      div.style.left = x + "px";
      div.style.top = y + "px";
    };

    const up = () => {
      isDragging = false;
      div.style.cursor = "grab";
    };

    div.addEventListener("mousedown", down);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);

    return () => {
      div.removeEventListener("mousedown", down);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
  }, [isMinimized]);

  const widthWeb = window.innerWidth;

  return (
    <>
      {/* FILTER */}
      <section className="food-filter">
        <div className="filter-container">
          <button className="filter-btn active">Tất cả</button>
          <button className="filter-btn">Lẩu</button>
          <button className="filter-btn">Đồ nướng</button>
          <button className="filter-btn">Nước uống</button>
          <button className="filter-btn">Ăn vặt</button>
        </div>
      </section>


      {/* PRODUCTS */}
      {
        loadCard ? (
         <CardLoading widthWeb={widthWeb}/>
        ) : (
          // <div className="card-products-container">
          //   <div className="products-grid">
          //     {productsData.map(p => (
          //       <div className="product-card" key={p._id}>

          //         <div className="product-image">
          //           <img src={p.img} alt={p.name} />
          //         </div>

          //         <div className="product-info">
          //           <h3 className="product-name">{p.name}</h3>
          //           <p className="product-price">{p.price.toLocaleString()} đ</p>

          //           <div className="product-actions">
          //             <button
          //               className="product-btn product-btn-cart"
          //               onClick={() => addToCart(p)}
          //             >
          //               Thêm
          //             </button>
          //             <button className="product-btn product-btn-buy">
          //               Mua ngay
          //             </button>
          //           </div>
          //         </div>

          //       </div>
          //     ))}
          //   </div>
          // </div>
          <CardProducts data={productsData}/>
        )
      }


      {/* Mini cart */}
      {/* {!isMinimized && (
        <aside className="cart" id="draggable-div">
          <div className="cart-header">
            <strong>🛒 Giỏ hàng</strong>
            <button onClick={() => setIsMinimized(true)}>—</button>
          </div>

          <div className="cart-list">
            {cart.map(item => (
              <div className="cart-item" key={item._id}>
                <div>
                  <span>{item.name}</span>
                  <small>x{item.quantity}</small>
                </div>
                <div>
                  <span>{(item.price * item.quantity).toLocaleString()} đ</span>
                  <div className="cart-actions">
                    <button onClick={() => subQty(item._id)}>-</button>
                    <button onClick={() => addQty(item._id)}>+</button>
                    <button onClick={() => removeItem(item._id)}>x</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="small">
            Tổng tiền: <strong>{sumProducts.toLocaleString()} đ</strong>
          </div>
        </aside>
      )}

      {isMinimized && (
        <aside className="iconCart" onClick={() => setIsMinimized(false)}>
          🛒
        </aside>
      )} */}
    </>
  );
}

export default Products;
