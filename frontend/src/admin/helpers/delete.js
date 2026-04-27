import { notifyApp } from "../../shared/notifications/ToastProvider";

function Delete({ set, Id, setId, setNotifMessage, setLoading, setNotifKey }) {
  const deleteItem = () => {
    const result = window.confirm("Ban co chac chan muon xoa?");
    if (!result) return;

    if (!Id) {
      notifyApp("Khong tim thay san pham de xoa", "error");
      return;
    }

    setLoading?.(true);
    setNotifKey?.((prev) => prev + 1);

    fetch(`/api/admin/products/delete/${Id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        set?.((prev) => prev.filter((item) => item._id !== Id && item.id !== Id));
        setId?.(Id);
        setNotifMessage?.(data?.message || "Xoa san pham thanh cong");
        notifyApp(data?.message || "Xoa san pham thanh cong", "success");
      })
      .catch(() => {
        setNotifMessage?.("Loi ket noi may chu");
        notifyApp("Loi ket noi may chu", "error");
      })
      .finally(() => {
        setTimeout(() => setLoading?.(false), 300);
      });
  };

  return (
    <button className="admin-btn" onClick={deleteItem} title="Xoa san pham">
      <i className="bi bi-trash"></i>
    </button>
  );
}

export default Delete;
