import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Doctor() {
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get("doctorId");
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [keyword, setKeyword] = useState("");

  const loadPatients = async () => {
    const res = await fetch(
      `http://localhost:3001/patients?doctorId=${doctorId}&keyword=${keyword}`
    );
    const data = await res.json();
    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const markCompleted = async (patientId) => {
    await fetch("http://localhost:3001/patient/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId }),
    });
    loadPatients();
  };

  const openSurvey = () => {
    window.open("https://www.wjx.top/vm/Pwx77fd.aspx");
  };

  return (
    <div className="page">
      <div className="section-title">
        <h2>我的患者</h2>
        <button
          onClick={() => {
            window.location.href = `http://localhost:3001/export/excel?doctorId=${doctorId}`;
          }}
        >
          导出 Excel
        </button>
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
                    navigate(`/doctor/patient/${p.id}?doctorId=${doctorId}`)
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
                  <button onClick={openSurvey}>填写问卷</button>
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
