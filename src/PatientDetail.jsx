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
    return <div style={{ padding: 20 }}>缺少 patientId</div>;
  }

  if (loading) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  if (!patientInfo) {
    return <div style={{ padding: 20 }}>患者信息不存在</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>患者详情 - {patientInfo.name || patientId}</h2>
      <div style={styles.infoBox}>
        <div>姓名：{patientInfo.name}</div>
        <div>手机号：{patientInfo.phone}</div>
        <div>入组日期：{patientInfo.enrollDate}</div>
        <div>状态：{patientInfo.status || "进行中"}</div>
      </div>

      <VisitForm patientId={patientId} doctorId={doctorId} />
    </div>
  );
}

/* ===== 样式 ===== */
const styles = {
  infoBox: {
    border: "1px solid #ddd",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
};
