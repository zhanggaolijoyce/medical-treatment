const express = require("express");
const XLSX = require("xlsx");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { db, init } = require("./db");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change";

app.use(express.json());
app.use(cors());

init();

app.get("/health", (req, res) => {
  res.send("ok");
});

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "未登录" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.doctorId = payload.doctorId;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "登录已过期" });
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return String(forwarded).split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
}

app.post("/login", (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ message: "手机号或密码不能为空" });
  }

  const doctor = db
    .prepare("SELECT * FROM doctors WHERE phone = ?")
    .get(phone);

  if (!doctor || !bcrypt.compareSync(password, doctor.password_hash)) {
    return res.status(401).json({ message: "账号或密码错误" });
  }

  const token = jwt.sign({ doctorId: doctor.id }, JWT_SECRET, {
    expiresIn: "7d"
  });

  return res.json({
    doctorId: doctor.id,
    token,
    mustChangePassword: Boolean(doctor.must_change_password)
  });
});

app.post("/doctor/change-password", auth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const doctor = db
    .prepare("SELECT * FROM doctors WHERE id = ?")
    .get(req.doctorId);

  if (!doctor) {
    return res.status(404).json({ message: "医生不存在" });
  }

  if (!oldPassword || !bcrypt.compareSync(oldPassword, doctor.password_hash)) {
    return res.status(400).json({ message: "旧密码错误" });
  }

  if (!newPassword) {
    return res.status(400).json({ message: "新密码不能为空" });
  }

  const nextHash = bcrypt.hashSync(newPassword, 10);
  db.prepare(
    "UPDATE doctors SET password_hash = ?, must_change_password = 0 WHERE id = ?"
  ).run(nextHash, doctor.id);

  return res.json({ success: true });
});

app.post("/patient", (req, res) => {
  const {
    doctorId,
    name,
    phone,
    category,
    consentSigned,
    consentName,
    consentPhone,
    consentTextVersion
  } = req.body;

  if (!doctorId) {
    return res.status(400).json({ message: "缺少医生信息" });
  }

  const doctor = db
    .prepare("SELECT id FROM doctors WHERE id = ?")
    .get(doctorId);
  if (!doctor) {
    return res.status(404).json({ message: "医生不存在" });
  }

  if (!name || !phone) {
    return res.status(400).json({ message: "姓名或手机号不能为空" });
  }

  const enrollDate = new Date().toISOString().slice(0, 10);
  const insertPatient = db.prepare(
    "INSERT INTO patients (doctor_id, name, phone, category, consent_signed, enroll_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const patientResult = insertPatient.run(
    doctorId,
    name,
    phone,
    category || "",
    consentSigned ? 1 : 0,
    enrollDate,
    "in_progress"
  );

  const patientId = patientResult.lastInsertRowid;

  if (consentSigned) {
    db.prepare(
      "INSERT INTO consents (patient_id, consent_text_version, signed_name, signed_phone, signed_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(
      patientId,
      consentTextVersion || "v1",
      consentName || name,
      consentPhone || phone,
      new Date().toISOString(),
      getClientIp(req),
      req.headers["user-agent"] || ""
    );
  }

  return res.json({ success: true, patientId });
});

app.get("/patients", auth, (req, res) => {
  const { keyword } = req.query;
  let sql =
    "SELECT id, name, phone, status FROM patients WHERE doctor_id = ?";
  const params = [req.doctorId];

  if (keyword) {
    sql += " AND (name LIKE ? OR phone LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const result = db.prepare(sql).all(...params);
  return res.json(result);
});

app.get("/patient-info", auth, (req, res) => {
  const { patientId } = req.query;
  if (!patientId) {
    return res.status(400).json({ message: "缺少 patientId" });
  }

  const patient = db
    .prepare(
      "SELECT id, name, phone, category, enroll_date AS enrollDate, status FROM patients WHERE id = ? AND doctor_id = ?"
    )
    .get(patientId, req.doctorId);

  if (!patient) {
    return res.status(404).json({ message: "患者不存在" });
  }

  return res.json(patient);
});

app.post("/patient/complete", auth, (req, res) => {
  const { patientId } = req.body;
  if (!patientId) {
    return res.status(400).json({ message: "缺少 patientId" });
  }

  const result = db
    .prepare(
      "UPDATE patients SET status = 'completed' WHERE id = ? AND doctor_id = ?"
    )
    .run(patientId, req.doctorId);

  if (result.changes === 0) {
    return res.status(404).json({ message: "患者不存在" });
  }

  return res.json({ success: true });
});

app.post("/form", auth, (req, res) => {
  const { patientId, formType, data } = req.body;
  if (!patientId || !formType) {
    return res.status(400).json({ message: "缺少 patientId 或表单类型" });
  }

  const patient = db
    .prepare("SELECT id FROM patients WHERE id = ? AND doctor_id = ?")
    .get(patientId, req.doctorId);
  if (!patient) {
    return res.status(404).json({ message: "患者不存在" });
  }

  db.prepare(
    "INSERT INTO forms (patient_id, doctor_id, form_type, data_json, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(
    patientId,
    req.doctorId,
    formType,
    JSON.stringify(data || {}),
    new Date().toISOString()
  );

  return res.json({ success: true });
});

app.get("/export/excel", auth, (req, res) => {
  const patients = db
    .prepare(
      "SELECT p.id, p.doctor_id, p.name, p.phone, p.category, p.consent_signed, p.enroll_date, p.status, c.signed_name, c.signed_phone, c.signed_at FROM patients p LEFT JOIN consents c ON c.id = (SELECT id FROM consents c2 WHERE c2.patient_id = p.id ORDER BY c2.signed_at DESC LIMIT 1) WHERE p.doctor_id = ?"
    )
    .all(req.doctorId);

  const forms = db
    .prepare(
      "SELECT patient_id, form_type, data_json, created_at FROM forms WHERE doctor_id = ?"
    )
    .all(req.doctorId);

  const patientRows = patients.map((p) => ({
    医生编号: p.doctor_id,
    患者编号: p.id,
    患者姓名: p.name,
    手机号: p.phone,
    类别: p.category || "",
    入组日期: p.enroll_date,
    状态: p.status,
    已签署知情同意: p.consent_signed ? "是" : "否",
    签署姓名: p.signed_name || "",
    签署电话: p.signed_phone || "",
    签署时间: p.signed_at || ""
  }));

  const formRows = forms.map((f) => ({
    患者编号: f.patient_id,
    表单类型: f.form_type,
    表单内容: f.data_json,
    提交时间: f.created_at
  }));

  const workbook = XLSX.utils.book_new();
  const patientSheet = XLSX.utils.json_to_sheet(patientRows);
  XLSX.utils.book_append_sheet(workbook, patientSheet, "医生患者");

  const formSheet = XLSX.utils.json_to_sheet(formRows);
  XLSX.utils.book_append_sheet(workbook, formSheet, "患者表单");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  return res.send(buffer);
});

app.get("/export/patient-excel", auth, (req, res) => {
  const { patientId } = req.query;
  if (!patientId) {
    return res.status(400).json({ message: "缺少 patientId" });
  }

  const patient = db
    .prepare(
      "SELECT id, doctor_id, name, phone, category, consent_signed, enroll_date, status FROM patients WHERE id = ? AND doctor_id = ?"
    )
    .get(patientId, req.doctorId);

  if (!patient) {
    return res.status(404).json({ message: "患者不存在" });
  }

  const consents = db
    .prepare(
      "SELECT signed_name, signed_phone, signed_at FROM consents WHERE patient_id = ? ORDER BY signed_at DESC LIMIT 1"
    )
    .get(patientId);

  const forms = db
    .prepare(
      "SELECT patient_id, form_type, data_json, created_at FROM forms WHERE doctor_id = ? AND patient_id = ?"
    )
    .all(req.doctorId, patientId);

  const patientRows = [
    {
      医生编号: patient.doctor_id,
      患者编号: patient.id,
      患者姓名: patient.name,
      手机号: patient.phone,
      类别: patient.category || "",
      入组日期: patient.enroll_date,
      状态: patient.status,
      已签署知情同意: patient.consent_signed ? "是" : "否",
      签署姓名: consents?.signed_name || "",
      签署电话: consents?.signed_phone || "",
      签署时间: consents?.signed_at || ""
    }
  ];

  const formRows = forms.map((f) => ({
    患者编号: f.patient_id,
    表单类型: f.form_type,
    表单内容: f.data_json,
    提交时间: f.created_at
  }));

  const workbook = XLSX.utils.book_new();
  const patientSheet = XLSX.utils.json_to_sheet(patientRows);
  XLSX.utils.book_append_sheet(workbook, patientSheet, "患者信息");

  const formSheet = XLSX.utils.json_to_sheet(formRows);
  XLSX.utils.book_append_sheet(workbook, formSheet, "患者表单");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  res.setHeader("Content-Disposition", "attachment; filename=patient-export.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  return res.send(buffer);
});

const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    if (req.method !== "GET") {
      return res.status(404).end();
    }
    return res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(3001, () => {
  console.log("server running on 3001");
});
