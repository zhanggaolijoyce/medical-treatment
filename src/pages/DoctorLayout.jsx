import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../services/auth";

export default function DoctorLayout() {
  const location = useLocation();
  const search = location.search || "";

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/";
    }
  }, []);

  return (
    <div>
      <div className="tab-strip">
        <NavLink
          to={`/doctor${search}`}
          end
          className={({ isActive }) =>
            `tab-link${isActive ? " active" : ""}`
          }
        >
          患者
        </NavLink>
        <NavLink
          to={`/doctor/qrcode${search}`}
          className={({ isActive }) =>
            `tab-link${isActive ? " active" : ""}`
          }
        >
          二维码
        </NavLink>
        <NavLink
          to={`/doctor/export${search}`}
          className={({ isActive }) =>
            `tab-link${isActive ? " active" : ""}`
          }
        >
          导出
        </NavLink>
        <NavLink
          to={`/doctor/password${search}`}
          className={({ isActive }) =>
            `tab-link${isActive ? " active" : ""}`
          }
        >
          修改密码
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
