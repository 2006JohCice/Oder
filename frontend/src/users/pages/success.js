import React, { useEffect } from "react";
import "../css/checkoutSucces/succes.css";

function OrderSuccess(props) {
  useEffect(() => {
    // Lấy orderId từ URL
    const urlParts = window.location.pathname.split('/');
    const orderId = urlParts[urlParts.length - 1];

    fetch(`/api/checkout/success/${orderId}`)
    // .then(res => res.json())
    // .then(data => {
    //   props.orderId = data._id;
    //   props.createdAt = new Date(data.createdAt).toLocaleString();
    //   props.paymentMethod = data.paymentMethod;
    //   props.orderStatus = data.status;
    // })
    // .catch(err => console.error('Lỗi khi lấy thông tin đơn hàng:', err));
  }, []);
  return (
    <div className="order-success-wrapper" style={{ display: "flex", gap: "20px" }}>
      <div className="order-success-card">
        <div className="icon-wrapper">
          <div className="success-icon">✓</div>
        </div>

        <h1 className="title">Đặt hàng thành công</h1>

        <p className="description">
          Cảm ơn bạn đã đặt đơn. Đơn của bạn đã được lưu trữ tại của hàng .
        </p>
        <p style={{ color: "gree" }}>
          Các Thủ Tục Nhận Bàn Và Thanh Toán Như Sau
          <br />
        </p>

        <div className="order-info">
          <p><strong>Mã đơn hàng:</strong> {props.orderId}</p>
          <p><strong>Thời gian:</strong> {props.createdAt}</p>
          <p><strong>Thanh toán:</strong> {props.paymentMethod} Tại Quán</p>
          <p><strong>Trạng Thái:</strong> {props.orderStatus} </p>

        </div>

        <div className="button-group" style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
          <a href="/" className="btn-order primary">Về trang chủ</a>
          <a href="/orders" className="btn-order outline">Xem đơn hàng</a>
        </div>
      </div>
      <div className="order-success-card" style={{ width: "100%", height: "50vh", border: "1px solid gray", borderRadius: "10px", padding: "10px" }}>
        <div className="icon-wrapper">
          <div className="">Hướng Dẫn Nhận Và Thanh Toán</div>
          <div class="accordion" id="accordionExample">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                  Cách Nhận Bàn
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                  <strong>Đến quầy đọc sđt và tên để nhận bàn tại lễ tân.</strong> Nhận đúng bàn và kiểm tra lại các món ăn trên <code>. giấy đặt đồ</code>.
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingTwo">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  Cách Thanh Toán
                </button>
              </h2>
              <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                  <strong>Vui lòng thanh toán tại quầy lễ tân trước khi nhận bàn.</strong> Chúng tôi chấp nhận tiền mặt và thẻ tín dụng.
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingThree">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                  Chính Sách Hoàn Trả
                </button>
              </h2>
              <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                  <strong>Chính sách hoàn trả:</strong> Chúng tôi chấp nhận yêu cầu hoàn trả trong vòng 5 giờ kể từ giờ ngày đặt hàng. Vui lòng liên hệ với bộ phận hỗ trợ khách hàng để biết thêm chi tiết sđt  <code>0569847809</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OrderSuccess;