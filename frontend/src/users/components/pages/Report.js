import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/UserSettings.css";

function Report() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        restaurant: "",
        report: "",
        sentiment: "bad",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch("/api/user/me", { credentials: "include" });
                if (!res.ok) {
                    navigate("/user/auth/login");
                    return;
                }

                const data = await res.json();
                setFormData((prev) => ({
                    ...prev,
                    fullname: data?.user?.fullname || data?.user?.name || "",
                    email: data?.user?.email || "",
                }));
            } catch (error) {
                setMessage("Không thể tải thông tin người dùng.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSending(true);
        setMessage("");

        try {
            const res = await fetch("/api/user/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage("Báo cáo đã được gửi đến admin. Cảm ơn phản ánh của bạn.");
                setFormData((prev) => ({ ...prev, restaurant: "", report: "", sentiment: "bad" }));
            } else {
                setMessage(data.message || "Gửi báo cáo thất bại, vui lòng thử lại sau.");
            }
        } catch (error) {
            setMessage("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải thông tin người dùng...</div>;
    }

    return (
        <section className="user-settings-page">
            <h2>Báo cáo Nhà Hàng</h2>
            <p>Gửi báo cáo về nhà hàng cho admin. Chọn đánh giá tốt hoặc xấu và mô tả chi tiết.</p>

            <form className="user-settings-form" onSubmit={handleSubmit}>
                <label htmlFor="fullname">Họ và tên</label>
                <input id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} required />

                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />

                <label htmlFor="restaurant">Nhà hàng</label>
                <input
                    id="restaurant"
                    name="restaurant"
                    value={formData.restaurant}
                    onChange={handleChange}
                    placeholder="Tên nhà hàng (nếu có)"
                />

                <label>Đánh giá</label>
                <div className="radio-group">
                    <label>
                        <input type="radio" name="sentiment" value="good" checked={formData.sentiment === "good"} onChange={handleChange} />
                        Tốt
                    </label>
                    <label>
                        <input type="radio" name="sentiment" value="bad" checked={formData.sentiment === "bad"} onChange={handleChange} />
                        Xấu
                    </label>
                </div>

                <label htmlFor="report">Nội dung báo cáo</label>
                <textarea
                    id="report"
                    name="report"
                    value={formData.report}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Mô tả chi tiết báo cáo"
                    required
                />

                <button type="submit" disabled={sending}>
                    {sending ? "Đang gửi..." : "Gửi báo cáo"}
                </button>

                {message && <p className="settings-message">{message}</p>}
            </form>
        </section>
    );
}

export default Report;
