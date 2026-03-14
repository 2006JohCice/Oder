/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from 'react';

function cartControl() {
    
    // Dữ liệu mẫu, sau này bạn có thể thay bằng state hoặc props
    const cartItems = [
    {
        id: 1,
        name: "Lẩu Thái hải sản",
        price: 500000,
        quantity: 1,
        image: "https://picsum.photos/seed/lau/200/200"
    },
    {
        id: 2,
        name: "Cơm gà xối mỡ",
        price: 750000,
        quantity: 2,
        image: "https://picsum.photos/seed/comga/200/200"
    },
    {
        id: 3,
        name: "Pizza phô mai",
        price: 1200000,
        quantity: 1,
        image: "https://picsum.photos/seed/pizza/200/200"
    },
    {
        id: 4,
        name: "Bún bò Huế",
        price: 450000,
        quantity: 1,
        image: "https://picsum.photos/seed/bunbo/200/200"
    },
    {
        id: 5,
        name: "Hamburger bò",
        price: 650000,
        quantity: 2,
        image: "https://picsum.photos/seed/hamburger/200/200"
    },
    {
        id: 6,
        name: "Sushi tổng hợp",
        price: 1500000,
        quantity: 1,
        image: "https://picsum.photos/seed/sushi/200/200"
    }
    ];


    const [cart, setCart] = useState(cartItems);

    const handleClick = (type, id) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.id === id) {
                    let newQuantity = item.quantity;
                    if (type === "plus") {
                        newQuantity += 1;
                    } else if (type === "minus" && item.quantity > 1) {
                        newQuantity -= 1;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    // Tính tổng tiền
    const [sum,setSum] = useState(0);

     useEffect(() => {
    setSum(cart.reduce((total, item) => total + item.price * item.quantity, 0));
  }, [cart]);


    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Tổng số đơn hàng chưa xử lý
    const countCart = cart.reduce((count, item) => count + item.quantity, 0);

    return {cart,handleClick,formatCurrency,shippingFee,sum,countCart}

 

}
export default cartControl;