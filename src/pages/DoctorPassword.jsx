import { useState } from "react";
import { apiFetch } from "../services/api";

export default function DoctorPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");

    try {
      const res = await apiFetch("/doctor/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
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
