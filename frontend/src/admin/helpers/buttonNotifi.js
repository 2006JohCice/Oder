/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
function ButtonNotifi() {
    return (
        <>
            <button type="button" data-bs-toggle="dropdown" aria-expanded="false" className="admin-btn"> <i className="bi bi-bell" > </i></button>

            <ul className="dropdown-menu" style={{transform: "translate3d(990px, 150px, 0px), width: 300px"}}>
                <li><a className="dropdown-item" href="#">Action</a></li>
                <li><a className="dropdown-item" href="#">Another action</a></li>
                <li><a className="dropdown-item" href="#">Something else here</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Separated link</a></li>
                <a className="text-center" href="#">Xem tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ thÃƒÂ´ng bÃƒÂ¡o</a>
            </ul>


{/* 

            <button type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                className="admin-btn">
                <i className="bi bi-bell" >
                </i></button>

            <ul
                className="dropdown-menu notification-dropdown show"
                style={{ transform: "translate3d(990px, 150px, 0px)", width: "190px" }}
            >
                <li><a className="dropdown-item" href="#">ThÃƒÂ´ng bÃƒÂ¡o mÃ¡Â»â€ºi 1</a></li>
                <li><a className="dropdown-item" href="#">ThÃƒÂ´ng bÃƒÂ¡o mÃ¡Â»â€ºi 2</a></li>
                <li><a className="dropdown-item" href="#">ThÃƒÂ´ng bÃƒÂ¡o mÃ¡Â»â€ºi 3</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li className="text-center mt-2">
                    <a href="#" className="see-all-link">Xem tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ thÃƒÂ´ng bÃƒÂ¡o</a>
                </li>
            </ul> */}

        </>
    )
}

export default ButtonNotifi;