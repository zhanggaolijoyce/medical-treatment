import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Doctor from "./Doctor";
import Patient from "./Patient";
import PatientDetail from "./PatientDetail";
import DoctorQRCode from "./pages/DoctorQRCode";
import DoctorExport from "./pages/DoctorExport";
import DoctorLayout from "./pages/DoctorLayout";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async () => {
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setMessage("登录失败，请检查账号密码");
        return;
      }

      const data = await res.json();
      setMessage("登录成功");

      // ✅ 登录成功后进入医生端
      window.location.href = `/doctor?doctorId=${data.doctorId}`;
    } catch (e) {
      setMessage("无法连接服务器");
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* ===== 默认：登录页 ===== */}
        <Route
          path="/"
          element={
            <div style={{ padding: 40, maxWidth: 400 }}>
              <h2>医生登录</h2>

              <input
                placeholder="账号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
              />

              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 10 }}
              />

              <button onClick={login} style={{ width: "100%", padding: 10 }}>
                登录
              </button>

              {message && <div style={{ marginTop: 15 }}>{message}</div>}
            </div>
          }
        />

        {/* ===== 医生端 ===== */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Doctor />} />
          <Route path="qrcode" element={<DoctorQRCode />} />
          <Route path="export" element={<DoctorExport />} />
          <Route path="patient/:patientId" element={<PatientDetail />} />
        </Route>

        {/* ===== 患者端 ===== */}
        <Route path="/patient" element={<Patient />} />

        {/* ===== 兜底 ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
