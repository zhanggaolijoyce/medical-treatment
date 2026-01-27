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
  const qrValue = `http://localhost:5173/patient/register?doctorId=${doctorId}`;

  return (
    <div className="page">
      <div className="card" style={{ textAlign: "center" }}>
        <h2>我的二维码</h2>
        <p className="subtitle">{doctor.name}</p>
        <QRCodeCanvas value={qrValue} size={220} />
        <p className="form-note">请患者使用手机扫码，填写知情同意并完成绑定</p>
      </div>
    </div>
  );
}
