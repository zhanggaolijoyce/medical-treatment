import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getDoctorId } from "../services/auth";

// ⚠️ 这里先假设你已经能拿到 doctorId
// 后面可以替换成真实登录态
const doctor = {
  name: "医生"
};

export default function DoctorQRCode() {
  const doctorId = getDoctorId();
  // 患者扫码后访问的地址
  const baseUrl = window.location.origin;
  const qrValue = doctorId
    ? `${baseUrl}/patient/register?doctorId=${doctorId}`
    : "";

  return (
    <div className="page">
      <div className="card" style={{ textAlign: "center" }}>
        <h2>我的二维码</h2>
        <p className="subtitle">{doctor.name}</p>
        {doctorId ? (
          <QRCodeCanvas value={qrValue} size={220} />
        ) : (
          <div className="form-note">未登录，无法生成二维码</div>
        )}
        <p className="form-note">请患者使用手机扫码，填写知情同意并完成绑定</p>
      </div>
    </div>
  );
}
