import React from "react";
import { useLocation } from "react-router-dom";

export default function DoctorExport() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const doctorId = params.get("doctorId");

  return (
    <div style={{ padding: 24 }}>
      <h2>导出数据</h2>
      <p>支持导出医生患者列表和患者表单数据。</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {doctorId && (
          <button
            onClick={() => {
              window.location.href = `http://localhost:3001/export/excel?doctorId=${doctorId}`;
            }}
          >
            导出当前医生数据
          </button>
        )}
        <button
          onClick={() => {
            window.location.href = "http://localhost:3001/export/excel";
          }}
        >
          导出全部医生数据
        </button>
      </div>
    </div>
  );
}
