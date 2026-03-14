import CardLoading from "../../mixi/CardLoading";
import CardProducts from "../../mixi/cardProducts/cardProducts";
import { useEffect, useState } from "react";

function NewProducts({DataProductsNew}) {


    return (
        <>
            <section className="food-filter">
                <div className="filter-container">
                    <button className="filter-btn active">Sản Phẩm Mới Nhất</button>
                </div>
            </section>

          
                <CardProducts data={DataProductsNew} />
        


        </>
    )
}

export default NewProducts;