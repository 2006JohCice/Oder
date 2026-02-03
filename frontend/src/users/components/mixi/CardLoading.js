

function CardLoading({widthWeb}) {

    const a = Array.from({ length: Math.floor(widthWeb / 220) - 1});

    return (
        <>
          <div className="card-products-container">
            <div className="products-grid">
            {a.map((_, idx) => (
                <div  aria-hidden="true" key={idx} style={{width:"100%",height:"220px"}}>
                    {/* <img src="..." className="card-img-top" alt="..." /> */}
                    <div className="card-body">
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-12"></span>
                        </p>
                    </div>

                    <div className="card-body">
                        <h5 className="card-title placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </h5>
                        <p className="card-text placeholder-glow">
                            <span className="placeholder col-7"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-6"></span>
                            <span className="placeholder col-8"></span>
                        </p>
                        <a href="#" tabIndex="-1" className="btn btn-primary disabled placeholder col-6"></a>
                    </div>
                </div>
            ))}
            </div>
            </div>
        </>
    );
}

export default CardLoading;