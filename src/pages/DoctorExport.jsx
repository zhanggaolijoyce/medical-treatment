import React from "react";
import { apiFetch } from "../services/api";

export default function DoctorExport() {
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
      <div className="card stack">
        <h2>导出数据</h2>
        <p>支持导出医生患者列表和患者表单数据。</p>
        <div className="button-row">
          <button onClick={downloadExport}>导出当前医生数据</button>
        </div>
      </div>
    </div>
  );
}
