import "../../css/ads/advertisement.css";
import { useRef, useState, useEffect } from "react";
import AutoCloseNotification from "../alerts/AutoCloseNotification";
function getRandomIndex(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function Advertisement() {

    // ADS 1
    const ads1Ref = useRef([]);
    const [ads1Count, setAds1Count] = useState(1);
    const [noTifi, setNoTifi] = useState("");
    const [dataUrlAds, setDataUrlAds] = useState(null);

    // ADS 2
    const ads2Ref = useRef([]);

    // Lấy dữ liệu quảng cáo từ API
    const dataUrlAdsApi = () => {
        fetch("/api/admin/advertisements")
            .then(res => res.json())
            .then(data => {
                setDataUrlAds(data);
                setAds1Count(data?.ads1?.images?.length || 1);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        dataUrlAdsApi();
    }, []);

    // Thêm input cho ads1 (tối đa 7)
    const addAds1 = () => {
        // Kiểm tra tất cả input đã nhập chưa
        const isValid = ads1Ref.current.every(input => input && input.value.trim() !== "");
        if (!isValid) {
            alert("Vui lòng nhập đầy đủ link ảnh quảng cáo!");
            return;
        }
        if (ads1Count >= 7) {
            alert("Chỉ được thêm tối đa 7 ảnh quảng cáo!");
            return;
        }
        setAds1Count(prev => prev + 1);
    };

    // Xử lý lưu quảng cáo
    const handleSave = () => {
        // Lấy giá trị từ input ads1
        const ads1 = ads1Ref.current
            .map(input => input?.value?.trim())
            .filter(val => val);

        const ads2 = ads2Ref.current
            .map(input => input?.value?.trim())
            .filter(val => val);

        const isAds1Valid = ads1.length === ads1Count && ads1.every(link => link !== "");
        const isAds2Valid = ads2.length === 2 && ads2.every(link => link !== "");

        if (!isAds1Valid || !isAds2Valid) {
            alert("Vui lòng nhập đầy đủ link ảnh quảng cáo cho tất cả các ô!");
            return;
        }

        const payload = {
            ads1: ads1,
            ads2: ads2
        };

        fetch("/api/admin/advertisements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                setNoTifi("Cập nhật quảng cáo thành công!");
                dataUrlAdsApi(); // reload lại dữ liệu mới
            })
            .catch((error) => {
                setNoTifi("Cập nhật quảng cáo thất bại!");
            });
    };

    return (
        <>
            <h2>Quản lý quảng cáo</h2>

            <div className="advertisement">
                {noTifi && (<AutoCloseNotification
                    key={noTifi}
                    message={noTifi}
                    onClose={() => setNoTifi("")}
                />)}
                <div className="advertisement-container">

                    {/*===== ADS LEFT==== */}
                    <div className="ads-left">
                        <img
                            src={dataUrlAds?.ads1?.images?.[getRandomIndex(0, dataUrlAds?.ads1?.images?.length || 1)] || ""}
                            alt="ads-1"
                            className="ads-img"
                        />

                        <div className="ads-left-info">
                            <div className="info-img_Setting">
                                Quảng cáo 1 _
                                <span style={{ fontWeight: "bold", color: "red" }}>
                                    1960 X 1200
                                </span>
                            </div>

                            <button
                                className="admin-select"
                                style={{
                                    marginTop: "10px",
                                }}
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#ads_1"
                            >
                                Thay đổi quảng cáo
                            </button>
                        </div>

                        <div className="col" style={{ position: "absolute", top: "120px", width: "99%" ,overflow: "auto", height: "500px"}}>
                            <div className="collapse multi-collapse" id="ads_1">
                                <div className="card card-body" style={{ width: "99%" }}>
                                    {[...Array(ads1Count)].map((_, idx) => (
                                        <>
                                            <input
                                                key={idx}
                                                ref={el => ads1Ref.current[idx] = el}
                                                type="text"
                                                className="form-control"
                                                placeholder={`Link ảnh quảng cáo ${idx + 1}`}
                                                defaultValue={dataUrlAds?.ads1?.images?.[idx] || ""}
                                                style={{
                                                    width: "100%",
                                                    marginTop: idx === 0 ? "0" : "10px"
                                                }}
                                            />
                                            <div className="ads-left-info">
                                                <button
                                                    style={{
                                                        marginTop: "10px",
                                                        backgroundColor: "#1e293b",
                                                        color: "#f8fafc",
                                                        border: "1px solid #334155",
                                                        borderRadius: "8px",
                                                        padding: "8px 12px",
                                                        fontSize: "15px",
                                                        outline: "none",
                                                        transition: "all 0.2s ease",
                                                        appearance: "none"
                                                    }}
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#show-ads_${idx}`}
                                                >
                                                    Show
                                                </button>
                                            </div>


                                            {/* <div className="col" style={{ position: "absolute", top: "120px", width: "99%" }}> */}
                                            <div className="collapse multi-collapse" id={`#show-ads_${idx}`} style={{ width: "99%" }}>
                                                {/* <div className="card card-body" style={{ width: "99%" }}> */}

                                                <div className="form-wrap">
                                                    <div className="form-item">
                                                        <span>Title</span>
                                                        <input />
                                                    </div>

                                                    <div className="form-item">
                                                        <span>Link Tới</span>
                                                        <input />
                                                    </div>

                                                    <div className="form-item">
                                                        <span>Nội Dung Demo</span>
                                                        <input />
                                                    </div>
                                                </div>

                                                {/* </div> */}
                                            </div>
                                            {/* </div> */}


                                        </>

                                    ))}

                                    <button
                                        className="btn-accent"
                                        style={{ marginTop: "10px" }}
                                        onClick={addAds1}
                                    >
                                        Thêm ảnh quảng cáo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*===== ADS RIGHT==== */}
                    <div className="ads-right">

                        {/* ADS 2 */}
                        <div className="ads-right-top">
                            <img
                                src={dataUrlAds?.ads2?.images?.[0] || ""}
                                alt="ads-2"
                                className="ads-img-right"
                            />

                            <div className="ads-right-top-info">
                                <div className="info-img_Setting">
                                    Quảng cáo 2 _
                                    <span style={{ fontWeight: "bold", color: "red" }}>
                                        800 X 200
                                    </span>
                                </div>

                                <button
                                    className="admin-select"
                                    style={{ marginTop: "10px" }}
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#ads_2"
                                >
                                    Thay đổi quảng cáo
                                </button>
                            </div>

                            <div className="col" style={{ position: "absolute", zIndex: 1, top: "100px", width: "96%" }}>
                                <div className="collapse multi-collapse" id="ads_2">
                                    <div className="card card-body" style={{ width: "100%" }}>
                                        {[0, 1].map((_, index) => (
                                            <input
                                                key={index}
                                                ref={el => ads2Ref.current[index] = el}
                                                type="text"
                                                className="form-control"
                                                placeholder={`Link ảnh quảng cáo ${index + 1}`}
                                                defaultValue={dataUrlAds?.ads2?.images?.[index] || ""}
                                                style={{
                                                    width: "100%",
                                                    marginTop: index === 0 ? "0" : "10px"
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ADS 3 */}
                        <div className="ads-right-bottom" style={{ marginTop: "20px" }}>
                            <img
                                src={dataUrlAds?.ads2?.images?.[1] || ""}
                                alt="ads-3"
                                className="ads-img-right"
                            />
                        </div>
                    </div>

                </div>

                <button
                    className="btn-accent"
                    style={{ marginTop: "20px" }}
                    onClick={handleSave}
                >
                    Lưu thay đổi
                </button>
            </div>
        </>
    );
}

export default Advertisement;