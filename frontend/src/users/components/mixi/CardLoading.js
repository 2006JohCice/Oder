/* eslint-disable unicode-bom */
function CardLoading() {
  return (
    <div className="empty-state">
      <i className="bi bi-emoji-smile" />
      <h3>ChÃ†Â°a cÃƒÂ³ mÃƒÂ³n Ã„Æ’n phÃƒÂ¹ hÃ¡Â»Â£p</h3>
      <div className="card-products-container">
        <div className="products-grid" style={{ display: "flex" }}>
          <div aria-hidden="true" style={{ width: "100%", height: "220px" }}>
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
              <span className="btn btn-primary disabled placeholder col-6"></span>
            </div>
          </div>
        </div>
      </div>
      <p>HÃƒÂ£y thÃ¡Â»Â­ bÃ¡Â»â„¢ lÃ¡Â»Âc khÃƒÂ¡c hoÃ¡ÂºÂ·c quay lÃ¡ÂºÂ¡i sau khi cÃ¡Â»Â­a hÃƒÂ ng cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡Â»Â±c Ã„â€˜Ã†Â¡n.</p>
    </div>
  );
}

export default CardLoading;
