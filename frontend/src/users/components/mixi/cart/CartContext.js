
import { createContext, useContext, useState } from "react";
export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Hàm fetch lại cart từ server
  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCartItems(data.products || []);
    setTotalQuantity(data.products?.reduce((sum, item) => sum + item.quantity, 0) || 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, totalQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}