import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { CartProvider } from "./users/components/mixi/cart/CartContext";
import { ToastProvider } from "./shared/notifications/ToastProvider";
// import { BrowserRouter } from 'react-router-dom';
// ...existing code...
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ToastProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </ToastProvider>
);

reportWebVitals();
