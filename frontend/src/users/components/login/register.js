import { useState } from "react";

import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
const RegisterPageUser = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messagePassword, setMessagePassword] = useState("");
    const [alert, setAlert] = useState("");;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setMessagePassword("")

        const url = '/api/admin/auth/login';
        try {
            const res = await fetch(url, {
                method: "POST",
                //   credentials: "include",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                navigate("/admin");
            } else {
                setMessage(result.message);
                setMessagePassword(result.messagePassword)
                setAlert(result.alerts)
            }
        } catch (error) {
            console.error("Lỗi kết nối server Error:", error);
            // setMessage("");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* LEFT */}
            <div className="login-left">
                <div className="login-box">
                    <header className="login-header">
                        <div className="icon-login">
                            <img
                                className="admin-logo_login"
                                alt="Admin Logo"
                                src="/logo.jpg"
                            />
                            {/* <h1 className="logo-text" style={{ color: "#c00" }}>ORDER</h1>
                            <h1 className="logo-text" style={{ color: "#c00" }}>SHOP</h1> */}

                        </div>
                        <p className="subtitle" style={{ color: "#c00" }}>Order - Shop</p>
                    </header>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            {message && <div className="error-alert">{message}</div>}
                            <input
                                type="text"
                                name="email"
                                placeholder="Email hoặc số điện thoại"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            {messagePassword && <div className="error-alert">{messagePassword}</div>}
                            <input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            {messagePassword && <div className="error-alert">{messagePassword}</div>}
                            <input
                                type="password"
                                name="password"
                                placeholder="Nhập Lại Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                    </form>

                    <div className="login-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Link to="/user/auth/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
                        <Link to="/user/auth/login" className="forgot-password">Đăng Nhập</Link>
                        {alert && <div className="error-alert">{alert}</div>}
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="login-right">
                <div className="right-content">
                    {/* <h1 className="right-logo"><span>LO</span><span>GO</span></h1> */}
                    <a href="/" class="mb-0 mb-lg-12">
                        <img alt="Logo" src="/Textlogo.png" class="h-60px h-lg-75px" style={{ width: "190px" }}></img>

                    </a>

                    <div className="mockup-area">
                        <img src="/avata-logo-right.jpg" alt="dashboard" />
                    </div>


                    <h2>Nhanh - Gọn - Lẹ</h2>
                    <p>
                        Order Shop Đặt Món Nhanh Chóng. </p>
                </div>
            </div>
        </div>
    );

};

export default RegisterPageUser;