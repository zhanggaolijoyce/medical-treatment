import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function DoctorPassword() {
  const location = useLocation();
  const search = new URLSearchParams(location.search || "");
  const doctorId = search.get("doctorId");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/doctor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, oldPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || "修改失败");
        return;
      }

      setOldPassword("");
      setNewPassword("");
      setMessage("密码修改成功");
    } catch (e) {
      setMessage("无法连接服务器");
    }
  };

  return (
    <div className="page">
      <div className="card stack" style={{ maxWidth: 420 }}>
        <h2>修改密码</h2>

        <input
          type="password"
          placeholder="旧密码"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="新密码"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button onClick={submit}>确认修改</button>

        {message && <div style={{ marginTop: 6 }}>{message}</div>}
      </div>
    </div>
  );
}
