/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import React, { useState, useEffect } from "react";
import "../../css/permission/permission.css";
import { notifyApp } from "../../../shared/notifications/ToastProvider";
import { apiFetch } from '../../../utils/apiFetch';
import {useNavigate} from 'react-router-dom';
const PermissionPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
     const [loading, setLoading] = useState(false);
    const permissionList = [];
    const fetchData = async () => {
        // try {
        //     const result = await apiFetch('/api/admin/role/permissions');
        //     setData(result);
        // } catch (error) {
        //     console.error('Error fetching data:', error);
        // }
        apiFetch('/api/admin/role/permissions')
            .then(res => setData(res))
            .catch(err => {
                if (err.status === 401) {
                    navigate('/admin/auth/login');
                }
                
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    console.log(data)

    const hanldSubmit = async () => {
        for (let i = 0; i < data.length; i++) {
            permissionList.push({
                roleId: data[i]._id,
                permissions: []
            });
            const checkboxes = document.querySelectorAll(`.permission-section-checkbox`);
            checkboxes.forEach((checkboxRow) => {
                const permissionName = checkboxRow.getAttribute('data-name');
                const checkbox = checkboxRow.querySelectorAll('input[type="checkbox"]')[i];
                if (checkbox.checked) {
                    permissionList[i].permissions.push(permissionName);
                }
            });
        }


        await fetch('/api/admin/role/permissions', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(permissionList),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                notifyApp("CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t phÃƒÂ¢n quyÃ¡Â»Ân thÃƒÂ nh cÃƒÂ´ng!", "success");
                setLoading(true);
                fetchData();
            })
            .catch((error) => {
                console.error('Error:', error);
            });


    }



    // console.log(data)

    return (
        <div className="permission">
            <div className="permission-container">
                <button className="permission-btn-update" onClick={hanldSubmit}>CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t</button>
                <h2 className="permission-title">ThiÃ¡ÂºÂ¿t lÃ¡ÂºÂ­p phÃƒÂ¢n quyÃ¡Â»Ân</h2>

                {/* BÃƒÂ i viÃ¡ÂºÂ¿t */}
                <div className="permission-section-title">BÃƒÂ i viÃ¡ÂºÂ¿t</div>
                <table className="permission-table">
                    <thead>
                        <tr >
                            <th>ChÃ¡Â»Â©c nÃ„Æ’ng</th>
                            {data.map((roleItem) => (
                                <th key={roleItem._id} >{roleItem.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                            <td>ID</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>{roleItem._id}</td>
                            ))}
                        </tr> */}
                        <tr className="permission-section-checkbox" data-name="products-category-view">
                            <td>Xem</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-category-view")} />
                                </td>
                            ))}

                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-category-create">
                            <td>ThÃƒÂªm mÃ¡Â»â€ºi</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-category-create")} />
                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-category-change-status">
                            <td>Thay Ã„â€˜Ã¡Â»â€¢i trÃ¡ÂºÂ¡ng thÃƒÂ¡i</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-category-change-status")} />
                                </td>
                            ))}

                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-category-update">
                            <td>CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-category-update")} />
                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-category-delete">
                            <td style={{ color: "#ff6b6b" }}>XÃƒÂ³a</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-category-delete")} />
                                </td>
                            ))}
                        </tr>


                    </tbody>
                </table>

                {/* SÃ¡ÂºÂ£n phÃ¡ÂºÂ©m */}
                <div className="permission-section-title">SÃ¡ÂºÂ£n phÃ¡ÂºÂ©m</div>
                <table className="permission-table">
                    <thead>
                        <tr>
                            <th>ChÃ¡Â»Â©c nÃ„Æ’ng</th>
                            {data.map((roleItem) => (
                                <th key={roleItem._id}>{roleItem.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>

                        <tr className="permission-section-checkbox" data-name="products-view">
                            <td>Xem</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-view")} />
                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-create">
                            <td>ThÃƒÂªm mÃ¡Â»â€ºi</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-create")} />

                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-change-status">
                            <td>Thay Ã„â€˜Ã¡Â»â€¢i trÃ¡ÂºÂ¡ng thÃƒÂ¡i</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-change-status")} />

                                </td>
                            ))}

                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-update">
                            <td>CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-update")} />

                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="products-delete">
                            <td style={{ color: "#ff6b6b" }}>XÃƒÂ³a</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("products-delete")} />

                                </td>
                            ))}
                        </tr>

                    </tbody>
                </table>

                {/* NhÃƒÂ³m QuyÃ¡Â»Ân */}
                <div className="permission-section-title">NhÃƒÂ³m QuyÃ¡Â»Ân</div>
                <table className="permission-table">
                    <thead>
                        <tr>
                            <th>ChÃ¡Â»Â©c nÃ„Æ’ng</th>
                            {data.map((roleItem) => (
                                <th key={roleItem._id}>{roleItem.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>

                        <tr className="permission-section-checkbox" data-name="role-view">
                            <td>Xem</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("role-view")} />
                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="role-create">
                            <td>ThÃƒÂªm mÃ¡Â»â€ºi tÃƒÂ i khoÃ¡ÂºÂ£n</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("role-create")} />

                                </td>
                            ))}
                        </tr>
{/* 
                        <tr className="permission-section-checkbox" data-name="role-change-status">
                            <td>Thay Ã„â€˜Ã¡Â»â€¢i trÃ¡ÂºÂ¡ng thÃƒÂ¡i</td>
                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("role-change-status")} />

                                </td>
                            ))}

                        </tr> */}

                        <tr className="permission-section-checkbox" data-name="role-update">
                            <td>CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t tÃƒÂ i khoÃ¡ÂºÂ£n</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("role-update")} />

                                </td>
                            ))}
                        </tr>

                        <tr className="permission-section-checkbox" data-name="role-delete">
                            <td style={{ color: "#ff6b6b" }}>XÃƒÂ³a</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("role-delete")} />

                                </td>
                            ))}
                        </tr>

                         <tr className="permission-section-checkbox" data-name="role-permission">
                            <td style={{ color: "rgb(205 255 107)" }}>PhÃƒÂ¢n QuyÃ¡Â»Ân</td>

                            {data.map((roleItem) => (
                                <td key={roleItem._id}>
                                    <input type="checkbox" defaultChecked={roleItem.permissions.includes("role-permission")} />

                                </td>
                            ))}
                        </tr>


                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default PermissionPage;
