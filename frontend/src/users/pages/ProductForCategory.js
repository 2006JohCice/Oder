import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CardLoading from "../components/mixi/CardLoading";
import CardProducts from "../components/mixi/cardProducts/cardProducts";

function ProductCategoryPage() {
    const { slugCategory } = useParams();
    const [data , setData] = useState([])
    // console.log("here", slugCategory)
    const [loadingCard, setLoadingCard] = useState(true);
    const widthWeb = window.innerWidth;
    useEffect(() => {
        let url = `/api/products/${slugCategory}`;

        fetch(url)
            .then(res => res.json()) 
            .then(res => {
                setData(res)
                setLoadingCard(false)
            })
            .catch(err => {
                console.error("FETCH ERROR:", err);
            });
    }, [slugCategory]);

    return (
        <div>
            {

                loadingCard ? (<CardLoading widthWeb={widthWeb} />
                ) : (<CardProducts data={data} />)

            }

           

        </div>
    );
}

export default ProductCategoryPage;
