import CardLoading from "../../mixi/CardLoading";
import { useState, useEffect } from "react";
import CardProducts from "../../mixi/cardProducts/cardProducts";
import NewProducts from "./newProducts";

function FeaturedProducts() {
    const widthWeb = window.innerWidth;
    const [dataFeatured, setDataFeatured] = useState([]);
    const [DataProductsNew, setDataProductsNew] = useState([]);
    const [loadCard, setLoadCart] = useState(true)

    useEffect(() => {
        let url = '/api/products/featured'
        fetch(url)
            .then(res => res.json())
            .then(res => {
                setDataFeatured(res.data)
                setDataProductsNew(res.dataProductsNew)
                setLoadCart(false)
            })
            .catch(() => setLoadCart(true));


    }, [])


    // console.log("demo", dataFeatured)

    return (

        <>

            <section className="food-filter">
                <div className="filter-container">
                    <button className="filter-btn active">Sản Phẩm Nổi Bật Của Shop</button>
                    <button className="filter-btn ">Sản Phẩm Giảm Giá</button>
                </div>
            </section>

            {loadCard ? (
                <CardLoading widthWeb={widthWeb} />
            ) : (
                <>

                <CardProducts data={dataFeatured} />
                <NewProducts DataProductsNew={DataProductsNew}/>
                </>
             

            )

            }


        </>
    )
}

export default FeaturedProducts;