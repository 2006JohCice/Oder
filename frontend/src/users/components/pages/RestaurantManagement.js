import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RestaurantManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/restaurant-owner");
  }, [navigate]);

  return <div>Đang chuyển hướng...</div>;
};

export default RestaurantManagement;