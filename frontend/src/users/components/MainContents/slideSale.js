
import "../../css/MainContent/sileSale.css";
function SlideSale() {
    return (
        <div className="slide-sale">
            <div className="slide-image">
                <img
                    src="https://cdn.tgdd.vn/2024/05/banner/800-200-800x200-12.png"
                    alt="Slide Sale"
                />
              
                <img
                    src="https://cdn.tgdd.vn/2024/05/banner/800-200-800x200-10.png"
                    alt="Slide Sale"
                    style={{ marginTop: '20px' }}
                />
            </div>

            {/* <div className="slide-info">
                <h2>Khuyến mãi lớn</h2>
                <p>Giảm đến 50% cho nhiều sản phẩm</p>
                <button>Mua ngay</button>
            </div> */}
        </div>

    );
}

export default SlideSale;