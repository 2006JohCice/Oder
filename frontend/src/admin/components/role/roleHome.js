/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
// import { useState, useEffect } from "react";
import "../../css/products/ProductsAdmin.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from '../../../utils/apiFetch';
import { useNavigate } from "react-router-dom";

const RoleHome = () => {
    const navigate = useNavigate();
    const [data,setDataa] = useState([]);

    const fetchData = () => {
        let url = "/api/admin/role/create";
        apiFetch(url)
            .then((data) => {
                setDataa(data);
            })
            .catch(err =>{
              if(err.status === 401){
                navigate('/admin/auth/login')
              }
            })
    };

    useEffect(() => {
        fetchData();
    }, []);
  
    const handlDelete = (id) => {
     
        let url = `/api/admin/role/delete/${id}`;
        try {
            fetch(url, {
                method: "DELETE",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.message) {
                        alert(data.message)
                        fetchData();
                    }
                })
        } catch (error) {
            console.error("Error:", error);
        }
    
      }

    


  return (
    <div className="products-page">

      <header className="products-header">
        <h1>Quản lý phân quyền</h1>
          <div div style={{ display: "flex", gap: "10px" }}>

        <Link to = {`/admin/role/create`}>
        <button className="btn-accent" type="button" >
            + Thêm Quyền
          </button>
        </Link>
          

        </div>
     


      </header>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>STT </th>
              <th>Nhóm Quyền</th>
              <th>Miêu tả</th>
              <th>Hình ảnh</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td style={{ display: "flex", gap: "5px" }}>
                  <Link to={`/admin/role/edit/${item._id}`}>
                  <button className="admin-btn">Sửa</button>
                  </Link>
                 
                  <button className="admin-btn" onClick={() => handlDelete(item._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default RoleHome;
