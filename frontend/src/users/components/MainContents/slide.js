import "../../css/MainContent/slide.css";
import React from 'react'; // Nên import React để rõ ràng

function Slide() {
  return (
    
      <div className="slide-infoShop">
        <div id="carouselExampleDark" className="carousel carousel-dark slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active" data-bs-interval="10000">
              <img src="https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2022/8/23/1084128/Isushi.jpeg" className="d-block w-100 carousel-img-fit" alt="..." />
              <div className="carousel-caption d-none d-md-block">
                <button className="btn btn-primary btn-silde">Tìm Hiểu </button>

                <h5>First slide label</h5>
                <p>Some representative placeholder content for the first slide.</p>
              </div>
            </div>
            <div className="carousel-item" data-bs-interval="2000">
              {/* Thêm class mới vào đây */}
              <img src="https://noithatphacach.com/wp-content/uploads/2024/04/mau-nha-hang-dep-don-gian-1.jpg" className="d-block w-100 carousel-img-fit" alt="..." />
              <div className="carousel-caption d-none d-md-block">
                <button className="btn btn-primary btn-silde">Tìm Hiểu </button>
                <h5>Second slide label</h5>
                <p>Some representative placeholder content for the second slide.</p>
              </div>
            </div>
            <div className="carousel-item">
              {/* Thêm class mới vào đây */}
              <img src="https://thietkeaz.com/images/img-1608002314.jpg" className="d-block w-100 carousel-img-fit" alt="..." />
              <div className="carousel-caption d-none d-md-block">
                <button className="btn btn-primary btn-silde">Tìm Hiểu </button>

                <h5>Third slide label</h5>
                <p>Some representative placeholder content for the third slide.</p>
              </div>
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>


  
  );
}

export default Slide;