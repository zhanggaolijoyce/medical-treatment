import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./services/api";

export default function Doctor() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [keyword, setKeyword] = useState("");

  const loadPatients = async () => {
    const res = await apiFetch(
      `/patients?keyword=${encodeURIComponent(keyword || "")}`
    );
    if (res.status === 401) {
      window.location.href = "/";
      return;
    }
    const data = await res.json();
    setPatients(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadPatients();
    const timer = setInterval(loadPatients, 3000);
    return () => clearInterval(timer);
  }, []);

  const markCompleted = async (patientId) => {
    await apiFetch("/patient/complete", {
      method: "POST",
      body: JSON.stringify({ patientId }),
    });
    loadPatients();
  };

  const downloadExport = async () => {
    const res = await apiFetch("/export/excel");
    if (!res.ok) {
      alert("导出失败");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="section-title">
        <h2>我的患者</h2>
      </div>

      <div className="card stack" style={{ marginBottom: 16 }}>
        <div className="subtitle">快速检索患者信息</div>
        <div className="inline-inputs">
          <input
            placeholder="搜索姓名或手机号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button onClick={loadPatients}>搜索</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id}>
              <td>
                <button
                  onClick={() =>
                    navigate(`/doctor/patient/${p.id}`)
                  }
                  className="link-button"
                >
                  {p.name}
                </button>
              </td>
              <td>{p.phone}</td>
              <td>{p.status === "completed" ? "已完成" : "进行中"}</td>
              <td>
                <div className="table-actions">
                  <button
                    onClick={() =>
                      navigate(`/doctor/patient/${p.id}`)
                    }
                  >
                    填写表单
                  </button>
                  {p.status !== "completed" && (
                    <button onClick={() => markCompleted(p.id)}>标记完成</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
