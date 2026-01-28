import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import VisitForm from "./components/VisitForm";
import { apiFetch } from "./services/api";

export default function PatientDetail() {
  const { patientId: patientIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = patientIdParam || searchParams.get("patientId"); // path param first
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 拉取患者基本信息
  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      try {
        const res = await apiFetch(
          `/patient-info?patientId=${encodeURIComponent(patientId)}`
        );
        if (res.ok) {
          const data = await res.json();
          setPatientInfo(data);
        }
      } catch (e) {
        console.error("获取患者信息失败", e);
      } finally {
        setLoading(false);
      }
    }
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  if (!patientId) {
    return <div className="page">缺少 patientId</div>;
  }

  if (loading) {
    return <div className="page">加载中...</div>;
  }

  if (!patientInfo) {
    return <div className="page">患者信息不存在</div>;
  }

  const downloadPatientExport = async () => {
    const res = await apiFetch(
      `/export/patient-excel?patientId=${encodeURIComponent(patientId)}`
    );
    if (!res.ok) {
      alert("导出失败");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patientInfo.name || "patient"}-export.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="card">
        <h2>患者详情 - {patientInfo.name || patientId}</h2>
        <div className="info-grid">
          <div>姓名：{patientInfo.name}</div>
          <div>手机号：{patientInfo.phone}</div>
          <div>类别：{patientInfo.category || "-"}</div>
          <div>入组日期：{patientInfo.enrollDate}</div>
          <div>状态：{patientInfo.status || "进行中"}</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={downloadPatientExport}>导出该患者表单</button>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <VisitForm patientId={patientId} />
      </div>
    </div>
  );
}
