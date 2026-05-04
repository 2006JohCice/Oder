/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */
import { useState, useEffect } from "react";
import PaginationHelper from "../helpers/pagination";
import Delete from "../helpers/delete";
import Loading from "../helpers/loading";
import { apiFetch } from '../../utils/apiFetch';
import { useNavigate } from "react-router-dom";
import { notifyApp } from "../../shared/notifications/ToastProvider";
function MainAdmin({ query, searchType }) {

  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [sumUsers, setSumUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [idUser, setIdUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [totalUser,setTotalUser] = useState()
  const [totalSuspended,setTotalSuspended] = useState(0)
  const [totalPending ,setTotalPending] = useState(0)
  const [orders, setOrders] = useState(0);
  const [ordering, setOrdering] = useState(0);
  // //   totalUser: 0,
  //   totalSuspended:0,
  //   totalPending:0
  const [revenue, setRevenue] = useState(0);

    
    // --- CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃƒÂ´ng tin ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng ---
    const handleSave = (e) => {
        e.preventDefault();
        if (selected) {

            let url = `/api/admin/listAccount/edit/${selected._id}`;
            fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selected),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        notifyApp("Thay Ã„ÂÃ¡Â»â€¢i ThÃƒÂ nh CÃƒÂ´ng", "success");
                        setSelected(null);
                    }
                });
        }
    };


  const checkBoxSetting = () => {
    notifyApp("CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t", "success");
  }







  const fetchUser = () => {
    // let url = '/api/admin/userAdmin';
    // const params = [];


    // if (filters.status) {
    //   params.push(`status=${filters.status}`);
    // }
    // if (filters.role) {
    //   params.push(`role=${filters.role}`);
    // }
    // if (query) {
    //   params.push(`userName_email=${query}`);
    // }
    // if (page) {
    //   params.push(`page=${page}`);
    // }
    // if (params.length > 0) {
    //   url += `?${params.join('&')}`;
    // }
    // apiFetch(url)
    //   .then((res => {
    //     setUsers(res.data)
    //     setTotalPages(res.objPagination.totalPages)
    //     setSumUsers(res.data)
    //   }))
    //   .catch(err => {
    //     if (err.status === 401) {
    //       navigate('/admin/auth/login');
    //     }
    //   });
    let urlDone =`/api/admin/checkout/doneOrder`
    apiFetch(urlDone)
      .then((res =>{
        res.orders.forEach(order => {
          if (order) {
            setRevenue(prev => prev + order.products.reduce((sum, item) => sum + item.price * item.quantity, 0));
            // setRevenue(0)
          }
        });
      }))
      .catch(err => {
        if (err.status === 401) {
          navigate('/admin/auth/login');
        }
      });
    
    let urlOrder = `/api/admin/checkout/doneOrder`
    apiFetch(urlOrder)
      .then((res =>{
        setOrders(res.orders.length)
        setOrdering(res.orders.filter(order => order.status === "pending").length)
      }))

    let urlUser = `/api/user`
    apiFetch(urlUser)
      .then((res =>{
        setTotalUser(res.users.length)
      }))
    let url = `/api/admin/listAccount`
    apiFetch(url)
      .then((res => {
        setUsers(res.records)
      }))
      .catch(err => {
        if (err.status === 401) {
          navigate('/admin/auth/login');
        }
      });

  };
  


  const editUser = async () => {
    try {
      const res = await fetch(`/api/admin/userAdmin/edit/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected),
      });

      if (res.ok) {
        fetchUser();
        notifyApp("CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃƒÂ nh cÃƒÂ´ng!", "success");
        setSelected(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUser();
    }, 500);
    return () => clearTimeout(delayDebounce);

  }, [query, page]);





  const idDeleteUser = (Id) => {

    // eslint-disable-next-line no-restricted-globals
    const result = confirm("BÃ¡ÂºÂ¡n cÃƒÂ³ chÃ¡ÂºÂ¯c chÃ¡ÂºÂ¯n muÃ¡Â»â€˜n xÃƒÂ³a user nÃƒÂ y?");
    if (result) {
      if (Id) {
        const url = `/api/admin/userAdmin/delete/${Id}`;

        apiFetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            setIdUser(Id);
            notifyApp(res.message, "success");
            fetchUser();
          })
          .catch((err) => {

          });

      }

    }
  }





  return (
    <>
      {
        (users && users.length === 0) ?
          <div className="admin-page-title">
            <Loading message="Ã„Âang ThÃ¡Â»â€˜ng KÃƒÂª..." />
          </div> : <div>
            <section className="admin-grid">
              <div className="admin-card">
                <h3>Users</h3>
                <div className="admin-stat">
                  <div>
                    <div className="admin-big">{totalUser}</div>
                    <div className="admin-trend">Active users</div>
                  </div>
                  <div className="admin-right"><div className="admin-trend">+6% vs last week</div></div>
                </div>
              </div>
              <div className="admin-card">
                <h3>Users Suspended</h3>
                <div className="admin-stat">
                  <div>
                    <div className="admin-big">{totalSuspended}</div>
                    <div className="admin-trend">Active Suspended</div>
                  </div>
                  <div className="admin-right"><div className="admin-trend">+2% vs last week</div></div>
                </div>
              </div>
              <div className="admin-card">
                <h3>Users Pending</h3>
                <div className="admin-stat">
                  <div>
                    <div className="admin-big">{totalPending}</div>
                    <div className="admin-trend">Active Pending</div>
                  </div>
                  <div className="admin-right"><div className="admin-trend">+1% vs last week</div></div>
                </div>
              </div>
              <div className="admin-card">
                <h3>Revenue</h3>
                <div className="admin-stat">
                  <div>
                    <div className="admin-big">Ã¢â€šÂ« {revenue}</div>
                    <div className="admin-trend">This month</div>
                  </div>
                  <div className="admin-right"><div className="admin-trend">+12% vs last month</div></div>
                </div>
              </div>
              <div className="admin-card">
                <h3>
                  Spending</h3>
                <div className="admin-stat">
                  <div>
                    <div className="admin-big">Ã¢â€šÂ« </div>
                    <div className="admin-trend">This month</div>
                  </div>
                  <div className="admin-right"><div className="admin-trend">0% vs last month</div></div>
                </div>
              </div>
              <div className="admin-card">
                <h3>

                  Reserves & Investments </h3>
                <div className="admin-stat">
                  <div>
                    <div className="admin-big">Ã¢â€šÂ« </div>
                    <div className="admin-trend">This month</div>

                  </div>
                  <div className="admin-right">
                    <div className="admin-trend">+0% vs last month</div>
                    <div className="admin-trend">
                      Reserves & Investments = Revenue x 21.3%</div>

                  </div>
                </div>
              </div>
            </section>

            <section className="admin-content">
              <div>
                <div className="admin-card admin-table">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>

                    <h3>Users overview</h3>

                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((item, index) => (
                        <tr key={item._id}>
                          <td>{index + 1}</td>
                          <td className="admin-bold">{item.fullname}</td>
                          <td>{item.email}</td>
                          <td>{item.role.description}</td>
                          <td><span className={`admin-badge ${item.status === "active" ? "admin-active" : ""}`}>{item.status}</span></td>
                          <td style={{ display: "flex", gap: "5px" }}>
                            <button className="admin-btn" onClick={() => setSelected(item)}><i class="bi bi-pen"></i></button>
                            <button className="admin-btn" onClick={() => idDeleteUser(item._id)}><i class="bi bi-trash"></i></button>

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <PaginationHelper totalPages={totalPages} page={page} setPage={setPage} />
                </div>
              </div>


              <aside className="admin-panel">
                <div className="admin-card">
                  <h3>User editor</h3>
                  
                    {(selected !== null) ? (
                        <div className="admin-card">
                       

                            <form onSubmit={handleSave}>

                                <div className="admin-editor" style={{ display: "grid", gap: "10px" }}>
                                    <div className="admin-field">
                                        <label htmlFor="name" className="admin-label">Name</label>
                                        <input
                                            id="name"
                                            className="admin-input"
                                            value={selected.fullname}
                                            onChange={(e) => setSelected({ ...selected, fullname: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="admin-field">
                                        <label htmlFor="email" className="admin-label">Email</label>
                                        <input
                                            id="email"
                                            className="admin-input"
                                            value={selected.email}
                                            onChange={(e) => setSelected({ ...selected, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="admin-field">
                                        <label htmlFor="password" className="admin-label">Password</label>
                                        <input
                                            id="password"
                                            className="admin-input"
                                            value={selected.newpassword}
                                            onChange={(e) => setSelected({ ...selected, password: e.target.value })}
                                            required
                                        />
                                    </div>


                                    <div className="admin-form-row" style={{ display: "grid", gap: "10px" }}>
                                        <div className="admin-field" style={{ display: "flex", gap: "5px" }}>


                                            <select
                                                id="status"
                                                className="admin-select"
                                                value={selected.status}
                                                onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                                            >
                                                <option value="active">Active</option>
                                                <option value="inActive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="admin-form-row">
                                        <button className="admin-btn admin-primary" type="submit">Save</button>
                                        <button className="admin-btn" type="button" onClick={() => {
                                            setSelected(null);
                                            // setActiveTab(null);
                                        }}>Cancel</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                    <div className="admin-muted">ChÃ¡Â»Ân mÃ¡Â»â„¢t user tÃ¡Â»Â« bÃ¡ÂºÂ£ng Ã„â€˜Ã¡Â»Æ’ chÃ¡Â»â€°nh sÃ¡Â»Â­a.</div>
                    )}
                </div>
                <div className="admin-card">
                  <h3>Quick stats</h3>
                  <div className="admin-kpi-grid">
                    <div className="admin-kpi"><h4>Orders</h4><div className="admin-kpi-value">{orders}</div></div>
                    <div className="admin-kpi"><h4>Ordering</h4><div className="admin-kpi-value">{ordering}</div></div>
                    <div className="admin-kpi"><h4>Conversion</h4><div className="admin-kpi-value">3.6%</div></div>
                    <div className="admin-kpi"><h4>Refunds</h4><div className="admin-kpi-value">0</div></div>
                  </div>
                </div>
              </aside>
            </section>



          </div>

      }

    </>
  )
}



export default MainAdmin