import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../css/listSearchProducts/searchProducts.css";
import CardLoading from "../mixi/CardLoading";
import CardProducts from "../mixi/cardProducts/cardProducts";

function SearchProduct() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);


  const searchParams = new URLSearchParams(location.search);
  console.log("location.search",location.search)
  const keyword = searchParams.get("keyword") || "";
  const locationParam = searchParams.get("location") || "all";
  const price = searchParams.get("price") || "all";
  const meal = searchParams.get("meal") || "all";

  useEffect(() => {
    setLoading(true);
    let url =`/api/search/${location.search}`
    fetch(url)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [location.search]);


  const widthWeb = window.innerWidth;

  return (
    <div className="search-page">
      {/* Header */}
      <div className="search-header">
        <h2>Kết quả tìm kiếm</h2>
        <p>
          Từ khóa: <strong>{keyword || "Không có"}</strong> | 
          Địa điểm: {locationParam} | 
          Giá: {price} | 
          Bữa ăn: {meal}
        </p>
      </div>

  
      {loading &&(
        <>
        <p className="loading">Đang tải dữ liệu...</p> 
         <CardLoading widthWeb={widthWeb}/>
        </>
         
         )}

      {/* <div className="search-result-list"> */}
        {!loading && data?.length > 0 ? (

        <CardProducts data ={data}/>
        ) : (
          !loading && <p className="no-result">Không tìm thấy sản phẩm phù hợp</p>
        )}
      {/* </div> */}
    </div>
  );
}

export default SearchProduct;
