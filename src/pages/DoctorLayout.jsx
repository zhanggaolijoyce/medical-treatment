import { NavLink, Outlet, useLocation } from "react-router-dom";

const tabBaseStyle = {
  padding: "10px 16px",
  border: "1px solid #ddd",
  borderBottom: "none",
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  color: "#333",
  textDecoration: "none",
  background: "#f7f7f7",
};

const activeTabStyle = {
  background: "#fff",
  fontWeight: 600,
};

const tabWrapStyle = {
  display: "flex",
  gap: 8,
  padding: "16px 24px 0",
  borderBottom: "1px solid #ddd",
  background: "#fff",
};

export default function DoctorLayout() {
  const location = useLocation();
  const search = location.search || "";

  return (
    <div>
      <div style={tabWrapStyle}>
        <NavLink
          to={`/doctor${search}`}
          end
          style={({ isActive }) => ({
            ...tabBaseStyle,
            ...(isActive ? activeTabStyle : null),
          })}
        >
          患者
        </NavLink>
        <NavLink
          to={`/doctor/qrcode${search}`}
          style={({ isActive }) => ({
            ...tabBaseStyle,
            ...(isActive ? activeTabStyle : null),
          })}
        >
          二维码
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
