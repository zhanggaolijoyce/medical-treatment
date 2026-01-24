import React from "react";
import { QRCodeCanvas } from "qrcode.react";

// ⚠️ 这里先假设你已经能拿到 doctorId
// 后面可以替换成真实登录态
const doctor = {
  id: "doctor_001",
  name: "张医生",
};

export default function DoctorQRCode() {
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get("doctorId") || doctor.id;
  // 患者扫码后访问的地址
  const qrValue = `http://localhost:5173/patient/consent?doctorId=${doctorId}`;

  return (
    <div style={styles.container}>
      <h2>我的二维码</h2>

      <div style={styles.card}>
        <p style={styles.doctorName}>{doctor.name}</p>

        <QRCodeCanvas value={qrValue} size={220} />

        <p style={styles.tip}>
          请患者使用手机扫码，填写知情同意并完成绑定
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    textAlign: "center",
  },
  card: {
    display: "inline-block",
    padding: "24px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    marginTop: "20px",
  },
  doctorName: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  tip: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#666",
  },
};
