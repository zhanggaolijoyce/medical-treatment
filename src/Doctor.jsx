import { useEffect, useState } from "react";

export default function Doctor() {
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get("doctorId");

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
    <div style={{ padding: 40 }}>
      <h2>我的患者</h2>

      <button
        style={{ marginBottom: 20 }}
        onClick={() => {
          window.location.href = `http://localhost:3001/export/excel?doctorId=${doctorId}`;
        }}
      >
        导出 Excel
      </button>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="搜索姓名或手机号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={loadPatients}>搜索</button>
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
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
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.status === "completed" ? "已完成" : "进行中"}</td>
              <td>
                <button onClick={openSurvey}>填写问卷</button>
                {p.status !== "completed" && (
                  <button onClick={() => markCompleted(p.id)}>标记完成</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
