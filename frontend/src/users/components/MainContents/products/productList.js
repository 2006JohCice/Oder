import React, { useEffect, useState } from "react";
import "../../../css/products/products.css"
import CardLoading from "../../mixi/CardLoading";
import CardProducts from "../../mixi/cardProducts/cardProducts";


const widthWeb = window.innerWidth;


function ProductsList() {

    const [data, setData] = useState([]);
    const [LoadingCart, setLoadingCart] = useState(true);
    useEffect(() => {
        fetch("https://myoder.onrender.com/api/products")
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoadingCart(false)

            })
            .catch(() => setData([]));
    }, []);
    console.log("here", data)

    return (
        <>

            {LoadingCart ? (
                <CardLoading widthWeb={widthWeb} />
            ) : (
                <CardProducts data={data} />
            )

            }


        </>
    );
}

export default ProductsList;