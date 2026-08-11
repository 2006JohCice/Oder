import "../../css/ads/advertisement.css";
import "../../css/shared/admin-components.css";
import { useState, useEffect } from "react";
import { notifyApp } from "../../../shared/notifications/ToastProvider";

function getRandomIndex(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function Advertisement() {
    const [dataUrlAds, setDataUrlAds] = useState(null);
    const [ads1, setAds1] = useState([{ image: "", title: "", desc: "", badge: "", link: "" }]);
    const [ads2, setAds2] = useState([
        { image: "", title: "", desc: "", badge: "", link: "" }
    ]);
    const [loading, setLoading] = useState(true);

    const dataUrlAdsApi = () => {
        setLoading(true);
        fetch("/api/admin/advertisements")
            .then(res => res.json())
            .then(data => {
                setDataUrlAds(data);
                if (data?.ads1?.items && data.ads1.items.length > 0) {
                    setAds1(data.ads1.items);
                }
                if (data?.ads2?.items && data.ads2.items.length > 0) {
                    const loadedAds2 = [...data.ads2.items];
                    while (loadedAds2.length < 1) {
                        loadedAds2.push({ image: "", title: "", desc: "", badge: "", link: "" });
                    }
                    setAds2(loadedAds2.slice(0, 1));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        dataUrlAdsApi();
    }, []);

    const addAds1 = () => {
        if (ads1.length >= 7) {
            notifyApp("Chỉ được thêm tối đa 7 ảnh quảng cáo!", "warning");
            return;
        }
        setAds1(prev => [...prev, { image: "", title: "", desc: "", badge: "", link: "" }]);
    };

    const handleAds1Change = (index, field, value) => {
        const newAds = [...ads1];
        newAds[index][field] = value;
        setAds1(newAds);
    };

    const handleAds2Change = (index, field, value) => {
        const newAds = [...ads2];
        newAds[index][field] = value;
        setAds2(newAds);
    };

    const handleSave = () => {
        const validAds1 = ads1.filter(ad => ad.image?.trim() !== "");
        const validAds2 = ads2.filter(ad => ad.image?.trim() !== "");

        if (validAds1.length === 0 || validAds2.length < 1) {
            notifyApp("Vui lòng nhập ít nhất 1 ảnh cho banner trái và 1 ảnh cho banner phải!", "warning");
            return;
        }

        const payload = { ads1: validAds1, ads2: validAds2 };

        fetch("/api/admin/advertisements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                notifyApp("Cập nhật quảng cáo thành công!", "success");
                dataUrlAdsApi();
            })
            .catch(() => {
                notifyApp("Cập nhật quảng cáo thất bại!", "error");
            });
    };

    return (
        <div className="adm-page">
            <div className="adm-page-header">
                <div>
                    <h1 className="adm-page-title">
                        <i className="bi bi-megaphone" style={{ color: "var(--adm-muted-2)", marginRight: 8 }} />
                        Quản lý Banner Quảng Cáo
                    </h1>
                    <p className="adm-page-sub">Cập nhật hình ảnh, tiêu đề và link điều hướng cho trang chủ</p>
                </div>
                <button className="adm-btn adm-btn--primary" onClick={handleSave}>
                    <i className="bi bi-floppy" /> Lưu thay đổi
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--adm-muted)" }}>
                    <div className="adm-spinner" /> Đang nạp dữ liệu...
                </div>
            ) : (
                <div className="advertisement-container" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    
                    {/* LEFT BANNER (SLIDER) */}
                    <div className="adm-card" style={{ flex: 1.5 }}>
                        <div className="adm-card-header">
                            <h2 style={{ fontSize: '1.1rem', margin: 0 }}><i className="bi bi-images" style={{ marginRight: '8px' }}/> Banner Chính (Trái)</h2>
                            <span style={{ fontSize: '13px', color: 'var(--adm-muted)' }}>Kích thước chuẩn: 1960 x 1200</span>
                        </div>
                        
                        <div className="adm-card-body">
                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', marginBottom: '20px', border: '1px dashed #cbd5e1' }}>
                                <img
                                    src={dataUrlAds?.ads1?.items?.[getRandomIndex(0, dataUrlAds?.ads1?.items?.length || 1)]?.image || "https://placehold.co/1960x1200?text=Preview+Left"}
                                    alt="ads-1-preview"
                                    style={{ width: "100%", borderRadius: "6px", aspectRatio: "16/7", objectFit: "cover" }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {ads1.map((ad, idx) => (
                                    <div key={idx} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong style={{ fontSize: '14px', color: '#334155' }}>Slide {idx + 1}</strong>
                                            <button
                                                className="adm-btn adm-btn--save" style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f5f9', color: '#475569' }}
                                                type="button" data-bs-toggle="collapse" data-bs-target={`#show-ads_${idx}`}
                                            >
                                                <i className="bi bi-pencil-square" /> Sửa chữ
                                            </button>
                                        </div>

                                        <div className="adm-form-group" style={{ marginBottom: '10px' }}>
                                            <input type="text" className="adm-form-input" placeholder="Link hình ảnh (https://...)" value={ad.image} onChange={(e) => handleAds1Change(idx, "image", e.target.value)} />
                                        </div>

                                        <div className="collapse" id={`show-ads_${idx}`}>
                                            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                                                    <label className="adm-form-label" style={{ fontSize: '13px' }}>Nhãn (Badge)</label>
                                                    <input className="adm-form-input" value={ad.badge} onChange={(e) => handleAds1Change(idx, "badge", e.target.value)} placeholder="VD: MỚI" />
                                                </div>
                                                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                                                    <label className="adm-form-label" style={{ fontSize: '13px' }}>Tiêu đề (Title)</label>
                                                    <input className="adm-form-input" value={ad.title} onChange={(e) => handleAds1Change(idx, "title", e.target.value)} placeholder="VD: Lẩu Thái \n Giảm 40%" />
                                                </div>
                                                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                                                    <label className="adm-form-label" style={{ fontSize: '13px' }}>Mô tả (Description)</label>
                                                    <input className="adm-form-input" value={ad.desc} onChange={(e) => handleAds1Change(idx, "desc", e.target.value)} placeholder="Mô tả ngắn gọn..." />
                                                </div>
                                                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                                                    <label className="adm-form-label" style={{ fontSize: '13px' }}>Link đích (Chuyển hướng)</label>
                                                    <input className="adm-form-input" value={ad.link} onChange={(e) => handleAds1Change(idx, "link", e.target.value)} placeholder="/products" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="adm-btn adm-btn--outline" style={{ marginTop: '15px', width: '100%', justifyContent: 'center' }} onClick={addAds1}>
                                <i className="bi bi-plus-lg" /> Thêm Slide Mới
                            </button>
                        </div>
                    </div>

                    {/* RIGHT BANNERS */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* RIGHT TOP */}
                        <div className="adm-card">
                            <div className="adm-card-header">
                                <h2 style={{ fontSize: '1.1rem', margin: 0 }}><i className="bi bi-layout-split" style={{ marginRight: '8px' }}/> Banner Phải (Dọc)</h2>
                                <span style={{ fontSize: '13px', color: 'var(--adm-muted)' }}>Chuẩn: 400 x 800</span>
                            </div>
                            <div className="adm-card-body">
                                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', marginBottom: '15px', border: '1px dashed #cbd5e1' }}>
                                    <img
                                        src={dataUrlAds?.ads2?.items?.[0]?.image || "https://placehold.co/400x800?text=Preview+Right+Banner"}
                                        alt="ads-2-preview"
                                        style={{ width: "100%", borderRadius: "6px", objectFit: "cover" }}
                                    />
                                </div>
                                <div className="adm-form-group" style={{ marginBottom: '10px' }}>
                                    <input type="text" className="adm-form-input" placeholder="Link ảnh quảng cáo" value={ads2[0]?.image} onChange={(e) => handleAds2Change(0, "image", e.target.value)} />
                                </div>
                                <button
                                    className="adm-btn adm-btn--outline" style={{ padding: '6px 12px', fontSize: '13px', width: '100%', justifyContent: 'center' }}
                                    type="button" data-bs-toggle="collapse" data-bs-target="#ads_2_0"
                                >
                                    <i className="bi bi-gear" /> Tùy chỉnh chi tiết
                                </button>
                                <div className="collapse" id="ads_2_0">
                                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input type="text" className="adm-form-input" placeholder="Nhãn (Badge)" value={ads2[0]?.badge} onChange={(e) => handleAds2Change(0, "badge", e.target.value)} />
                                        <input type="text" className="adm-form-input" placeholder="Tiêu đề" value={ads2[0]?.title} onChange={(e) => handleAds2Change(0, "title", e.target.value)} />
                                        <input type="text" className="adm-form-input" placeholder="Link đích" value={ads2[0]?.link} onChange={(e) => handleAds2Change(0, "link", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Advertisement;
