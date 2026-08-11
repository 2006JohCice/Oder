import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "../../css/RestaurantRegister.css";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position}></Marker>
  )
};
const RestaurantRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    locationLabel: "",
    lat: 21.028511, // Hanoi default
    lng: 105.804817,
  });

  const [files, setFiles] = useState({
    businessLicense: null,
    foodSafety: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Địa chỉ, Số điện thoại) ở Bước 1!");
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/restaurants/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location: { lat: formData.lat, lng: formData.lng },
          tables: [], // Default empty tables, can be added later
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Hồ sơ đã được gửi thành công! Chờ admin phê duyệt.");
        navigate("/");
        window.location.reload();
      } else {
        alert(data.message || "Có lỗi xảy ra khi đăng ký");
      }
    } catch (error) {
      alert("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gp-reg-page">
      <div className="gp-reg-hero">
        <div className="gp-reg-hero-content">
          <h1>Trở thành đối tác của Gourmet Pulse</h1>
          <p>Mở rộng phạm vi tiếp cận, tăng doanh thu và quản lý nhà hàng của bạn một cách chuyên nghiệp.</p>
        </div>
      </div>

      <div className="gp-reg-container">
        <div className="gp-reg-card">
          <div className="gp-reg-stepper">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`gp-step ${currentStep >= step ? "active" : ""}`}
                onClick={() => setCurrentStep(step)}
                style={{cursor: 'pointer'}}
              >
                <div className="gp-step-circle">{step}</div>
                <div className="gp-step-label">
                  {step === 1 && "Thông tin cơ bản"}
                  {step === 2 && "Giấy phép KD"}
                  {step === 3 && "Cấu hình thực đơn"}
                  {step === 4 && "Hoàn tất"}
                </div>
              </div>
            ))}
          </div>

          <div className="gp-reg-body">
            {currentStep === 1 && (
              <div className="gp-reg-section animate-fade-in">
                <h3 className="gp-reg-section-title">1. Thông tin cơ bản</h3>
                <p className="gp-reg-section-subtitle">Vui lòng cung cấp thông tin chính xác về nhà hàng của bạn.</p>
                <div className="gp-reg-row">
                  <div className="gp-reg-col" style={{ flex: 1 }}>
                    <label className="gp-reg-label">Tên nhà hàng <span>*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="gp-reg-input" placeholder="Nhập tên nhà hàng" />
                  </div>
                </div>
                <div className="gp-reg-row">
                  <div className="gp-reg-col">
                    <label className="gp-reg-label">Địa chỉ chi tiết <span>*</span></label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="gp-reg-input" placeholder="Số nhà, Tên đường, Phường/Xã..." />
                  </div>
                </div>
                <div className="gp-reg-row">
                  <div className="gp-reg-col">
                    <label className="gp-reg-label">Số điện thoại liên hệ <span>*</span></label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="gp-reg-input" placeholder="09xx xxx xxx" />
                  </div>
                  <div className="gp-reg-col">
                    <label className="gp-reg-label">Khu vực / Quận (Location Label)</label>
                    <input type="text" name="locationLabel" value={formData.locationLabel} onChange={handleInputChange} className="gp-reg-input" placeholder="Ví dụ: Cầu Giấy, Hà Nội" />
                  </div>
                </div>
                <div className="gp-reg-row">
                  <div className="gp-reg-col" style={{ flex: 1 }}>
                    <label className="gp-reg-label">Mô tả nhà hàng</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="gp-reg-input" placeholder="Giới thiệu ngắn về nhà hàng..." style={{minHeight: '80px'}}></textarea>
                  </div>
                </div>
                <div className="gp-reg-row">
                  <div className="gp-reg-col" style={{ flex: 1 }}>
                    <label className="gp-reg-label">Ghim vị trí nhà hàng trên bản đồ <span>*</span></label>
                    <p style={{fontSize: '13px', color: '#888', marginBottom: '10px'}}>Kéo và click để chọn chính xác toạ độ nhà hàng của bạn.</p>
                    <div style={{height: '300px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #444', zIndex: 1}}>
                      <MapContainer center={[formData.lat, formData.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <LocationMarker 
                          position={{lat: formData.lat, lng: formData.lng}} 
                          setPosition={(pos) => setFormData(p => ({...p, lat: pos.lat, lng: pos.lng}))} 
                        />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="gp-reg-section animate-fade-in">
                <h3 className="gp-reg-section-title">2. Giấy tờ pháp lý</h3>
                <p className="gp-reg-section-subtitle">Tải lên các tài liệu để xác minh doanh nghiệp (Có thể bỏ qua nếu chưa có).</p>
                <div className="gp-reg-uploads">
                  <div className="gp-upload-box" style={{position: 'relative'}}>
                    <input type="file" onChange={(e) => handleFileChange(e, 'businessLicense')} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} />
                    <i className="bi bi-file-earmark-text"></i>
                    <h5>Giấy phép kinh doanh</h5>
                    <p>{files.businessLicense ? <span style={{color: '#4CAF50'}}>{files.businessLicense.name}</span> : "Kéo thả file hoặc click để chọn tệp"}</p>
                  </div>
                  <div className="gp-upload-box" style={{position: 'relative'}}>
                    <input type="file" onChange={(e) => handleFileChange(e, 'foodSafety')} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} />
                    <i className="bi bi-shield-check"></i>
                    <h5>Giấy CN An toàn thực phẩm</h5>
                    <p>{files.foodSafety ? <span style={{color: '#4CAF50'}}>{files.foodSafety.name}</span> : "Kéo thả file hoặc click để chọn tệp"}</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="gp-reg-section animate-fade-in">
                <h3 className="gp-reg-section-title">3. Cấu hình thực đơn (Tuỳ chọn)</h3>
                <p className="gp-reg-section-subtitle">Bạn có thể tạo thực đơn và quản lý bàn sau khi nhà hàng được phê duyệt.</p>
                <div style={{padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '10px', border: '2px dashed #ddd'}}>
                  <i className="bi bi-menu-button-wide" style={{fontSize: '40px', color: '#c90000'}}></i>
                  <h4 style={{marginTop: '15px'}}>Khu vực cấu hình sau khi duyệt</h4>
                  <p style={{color: '#666'}}>Để đảm bảo chất lượng, tính năng thêm món ăn và sơ đồ bàn sẽ được mở khóa sau khi Ban Quản Trị xác nhận hồ sơ của bạn.</p>
                  <button onClick={nextStep} style={{marginTop: '20px', padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Chuyển sang Bước cuối</button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="gp-reg-section animate-fade-in">
                <h3 className="gp-reg-section-title">4. Hoàn tất</h3>
                <p className="gp-reg-section-subtitle">Kiểm tra lại thông tin và xác nhận gửi hồ sơ.</p>
                <div style={{padding: '30px', background: '#f8f9fa', borderRadius: '10px', marginTop: '20px'}}>
                  <h4>Tóm tắt thông tin:</h4>
                  <ul style={{lineHeight: '2', marginTop: '15px'}}>
                    <li><strong>Tên nhà hàng:</strong> {formData.name || <span style={{color: 'red'}}>Chưa nhập</span>}</li>
                    <li><strong>Địa chỉ:</strong> {formData.address || <span style={{color: 'red'}}>Chưa nhập</span>}</li>
                    <li><strong>Số điện thoại:</strong> {formData.phone || <span style={{color: 'red'}}>Chưa nhập</span>}</li>
                    <li><strong>Giấy tờ pháp lý:</strong> {files.businessLicense ? "Đã tải lên" : "Chưa tải lên"}</li>
                  </ul>
                  <p style={{marginTop: '20px', color: '#555'}}><i>Bằng việc nhấn "Gửi hồ sơ đăng ký", bạn đồng ý với <Link to="/legal/terms">Điều khoản dịch vụ</Link> &amp; <Link to="/legal/privacy">Chính sách bảo mật</Link> của Gourmet Pulse.</i></p>
                </div>
              </div>
            )}

            {/* FOOTER */}
            <div className="gp-reg-footer" style={{marginTop: '40px', display: 'flex', justifyContent: 'space-between'}}>
              {currentStep > 1 ? (
                <button className="gp-reg-btn-draft" onClick={prevStep}>Quay lại</button>
              ) : <div></div>}
              
              {currentStep < 4 ? (
                <button className="gp-reg-btn-submit" onClick={nextStep}>
                  Tiếp tục <i className="bi bi-arrow-right"></i>
                </button>
              ) : (
                <button className="gp-reg-btn-submit" onClick={handleSubmit} disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
                  {loading ? "Đang gửi..." : "Gửi hồ sơ đăng ký"} <i className="bi bi-check-circle"></i>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegister;
