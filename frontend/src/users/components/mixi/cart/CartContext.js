import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  //  fetchCart cố định (KHÔNG bị tạo lại)
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");

      if (!res.ok) {
        setCartItems([]);
        setTotalQuantity(0);
        return null;
      }

      const data = await res.json();

      const products = data.products || [];

      setCartItems(products);
      setTotalQuantity(
        products.reduce((sum, item) => sum + item.quantity, 0)
      );

      return data;
    } catch (error) {
      setCartItems([]);
      setTotalQuantity(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  //  load 1 lần khi app start
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  //  tránh re-render toàn app
  const value = useMemo(() => ({
    cartItems,
    totalQuantity,
    loading,
    fetchCart
  }), [cartItems, totalQuantity, loading, fetchCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}