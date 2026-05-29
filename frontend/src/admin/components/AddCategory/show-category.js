import { Link } from "react-router-dom";
import { prefixAdmin } from "../../../config/system";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import {confirmApp} from "../../../shared/notifications/ConfirmProvider";

function ShowCategory({ node, level = 0, fetchData }) {
  const prefix = "— ".repeat(level);

  const handleDelete = async () => {
    if (!(await confirmApp("Xác nhận", "Xác nhận xoá danh mục này?"))) return;
    try {
      const res = await fetch(`/api/admin/category/delete/${node._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        notifyApp(data.message || "Xoá thất bại", "error");
        return;
      }
      notifyApp(data.message || "Xoá thành công", "success");
      if (fetchData) fetchData();
    } catch (err) {
      notifyApp("Lỗi khi xóa", "error");
    }
  };

  return (
    <>
      <tr>
        <td>
          <input type="checkbox" className="adm-checkbox" />
        </td>
        <td className="adm-row-idx">{node.position}</td>
        <td>
          <div style={{ paddingLeft: `${level * 20}px`, display: "flex", alignItems: "center", gap: 8 }}>
            {level > 0 && <span style={{ color: "var(--adm-muted)", fontSize: 12 }}>↳</span>}
            <span style={{ fontWeight: 600, color: "var(--adm-text)" }}>{node.name}</span>
          </div>
        </td>
        <td>
          {node.img ? (
            <img src={node.img} alt={node.name} className="adm-product-img" style={{ width: 40, height: 40 }} />
          ) : (
            <div className="adm-product-img-placeholder" style={{ width: 40, height: 40, fontSize: 14 }}>
              <i className="bi bi-image" />
            </div>
          )}
        </td>
        <td className="adm-td-center">
          <input type="checkbox" className="adm-checkbox" checked={node.featured} readOnly />
        </td>
        <td className="adm-td-center">
          <input type="checkbox" className="adm-checkbox" checked={node.new} readOnly />
        </td>
        <td className="adm-td-center">
          <span className={`adm-badge adm-badge--${node.status === "active" ? "active" : "inactive"}`}>
            <i className={`bi bi-${node.status === "active" ? "check-circle" : "slash-circle"}`} />
            {node.status === "active" ? "Hoạt động" : "Tạm dừng"}
          </span>
        </td>
        <td className="adm-td-center">
          <div className="adm-actions" style={{ justifyContent: "center" }}>
            <Link to={`${prefixAdmin}admin/editCategory/${node._id}`} className="adm-btn adm-btn--edit adm-btn--icon" title="Chỉnh sửa">
              <i className="bi bi-pencil" />
            </Link>
            <button className="adm-btn adm-btn--danger adm-btn--icon" title="Xoá" onClick={handleDelete}>
              <i className="bi bi-trash3" />
            </button>
          </div>
        </td>
      </tr>

      {node.children && node.children.length > 0 &&
        node.children.map((child) => (
          <ShowCategory key={child._id} node={child} level={level + 1} fetchData={fetchData} />
        ))}
    </>
  );
}

export default ShowCategory;