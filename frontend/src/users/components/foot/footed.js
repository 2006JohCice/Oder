import "../../css/foot/footed.css";

function Footed() {
    return (
        <footer className="footed">
            <div className="footer-container">
                <div className="footer-column">
                    <h3>🍽 Clau Food</h3>
                    <p>Chuyên đồ ăn ngon – sạch – chuẩn vị Việt</p>
                </div>

                <div className="footer-column">
                    <h4>Liên hệ</h4>
                    <p> Hà Nội</p>
                    <p> 0938 966 114</p>
                    <p> claufood@gmail.com</p>
                </div>

                <div className="footer-column">
                    <h4>Giờ mở cửa</h4>
                    <p>Thứ 2 - Chủ nhật</p>
                    <p>08:00 - 22:00</p>
                </div>

                <div className="footer-column">
                    <h4>Theo dõi chúng tôi</h4>
                    <div className="social">
                        <span>Facebook</span>
                        <span> Instagram</span>
                        <span> TikTok</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                © 2026 Clau Food. All rights reserved.
            </div>
        </footer>
    );
}

export default Footed;
