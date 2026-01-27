import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import VisitForm from "./components/VisitForm";

export default function PatientDetail() {
  const { patientId: patientIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = patientIdParam || searchParams.get("patientId"); // path param first
  const doctorId = searchParams.get("doctorId");   // URL 里传 doctorId
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 拉取患者基本信息
  useEffect(() => {
    async function fetchPatient() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3001/patient-info?patientId=${patientId}`
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

  return (
    <div className="page">
      <div className="card">
        <h2>患者详情 - {patientInfo.name || patientId}</h2>
        <div className="info-grid">
          <div>姓名：{patientInfo.name}</div>
          <div>手机号：{patientInfo.phone}</div>
          <div>入组日期：{patientInfo.enrollDate}</div>
          <div>状态：{patientInfo.status || "进行中"}</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <VisitForm patientId={patientId} doctorId={doctorId} />
      </div>
    </div>
  );
}
