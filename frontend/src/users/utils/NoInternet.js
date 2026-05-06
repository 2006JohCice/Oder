import React from "react";
import Lottie from "lottie-react";
import animationData from "../../Json/no_internet_animation.json";

const NoInternet = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Lottie 
          animationData={animationData} 
          loop={true}
          style={{ width: 300 }}
        />

        <h2>Không có kết nối Internet</h2>
        <p>Vui lòng kiểm tra lại mạng của bạn</p>

        <button onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    background: "#1e1e2f",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff"
  },
  card: {
    textAlign: "center",
    padding: "30px",
    borderRadius: "10px",
    background: "#2c2c54",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)"
  }
};

export default NoInternet;