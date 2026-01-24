const express = require('express')
const XLSX = require('xlsx')
const app = express()

app.use(express.json())
app.use(require('cors')())

app.get('/health', (req, res) => {
  res.send('ok')
})

const doctors = [
    {
      id: 1,
      username: 'doctor1',
      password: '123456'
    }
  ]  

const patients = [
  {
    id: 1,
    doctorId: 1,
    name: '王小明',
    phone: '13800138000',
    consent: true,
    enrollDate: '2024-06-12',
    status: 'in_progress'
  },
  {
    id: 2,
    doctorId: 1,
    name: '李华',
    phone: '13900139000',
    consent: true,
    enrollDate: '2024-05-28',
    status: 'completed'
  }
]

app.post('/login', (req, res) => {
    const { username, password } = req.body
    const doctor = doctors.find(d => d.username === username)
  
    if (!doctor || doctor.password !== password) {
      return res.status(401).json({ message: '账号或密码错误' })
    }
  
    res.json({
      doctorId: doctor.id,
      token: 'mock-token'
    })
  })

app.post('/doctor/change-password', (req, res) => {
  const { doctorId, oldPassword, newPassword } = req.body
  const doctor = doctors.find(d => String(d.id) === String(doctorId))

  if (!doctor) {
    return res.status(404).json({ message: '医生不存在' })
  }

  if (!oldPassword || doctor.password !== oldPassword) {
    return res.status(400).json({ message: '旧密码错误' })
  }

  if (!newPassword) {
    return res.status(400).json({ message: '新密码不能为空' })
  }

  doctor.password = newPassword
  res.json({ success: true })
})

app.post('/patient', (req, res) => {
const { doctorId, name, phone, consent } = req.body

patients.push({
    id: patients.length + 1,
    doctorId,
    name,
    phone,
    consent,
    status: 'in_progress'
})

res.json({ success: true })
})

app.get('/patients', (req, res) => {
    const { doctorId, keyword } = req.query
  
    let result = patients.filter(
      p => String(p.doctorId) === String(doctorId)
    )
  
    if (keyword) {
      result = result.filter(p =>
        p.name.includes(keyword) || p.phone.includes(keyword)
      )
    }
  
    res.json(result)
  })  

app.get('/patient-info', (req, res) => {
  const { patientId } = req.query
  const patient = patients.find(p => String(p.id) === String(patientId))

  if (!patient) {
    return res.status(404).json({ message: '患者不存在' })
  }

  res.json({
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    enrollDate: patient.enrollDate || '',
    status: patient.status
  })
})
  
app.post('/patient/complete', (req, res) => {
const { patientId } = req.body

const patient = patients.find(p => p.id === patientId)
if (!patient) {
    return res.status(404).json({ message: '患者不存在' })
}

patient.status = 'completed'
res.json({ success: true })
})  

const forms = []

app.post('/form', (req, res) => {
  const { patientId, formType, data } = req.body

  forms.push({
    id: forms.length + 1,
    patientId,
    formType,
    data,
    createdAt: new Date()
  })

  res.json({ success: true })
})


app.get('/export/excel', (req, res) => {
  const { doctorId } = req.query

  const doctorById = new Map(doctors.map(d => [String(d.id), d]))
  const patientById = new Map(patients.map(p => [String(p.id), p]))

  const scopedPatients = doctorId
    ? patients.filter(p => String(p.doctorId) === String(doctorId))
    : patients

  const patientRows = scopedPatients.map(p => ({
    医生编号: p.doctorId,
    医生账号: (doctorById.get(String(p.doctorId)) || {}).username || '',
    患者姓名: p.name,
    手机号: p.phone
  }))

  const scopedPatientIds = new Set(scopedPatients.map(p => String(p.id)))
  const scopedForms = doctorId
    ? forms.filter(f => scopedPatientIds.has(String(f.patientId)))
    : forms

  const formRows = scopedForms.map(f => {
    const patient = patientById.get(String(f.patientId)) || {}
    return {
      患者编号: f.patientId,
      患者姓名: patient.name || '',
      手机号: patient.phone || '',
      表单类型: f.formType,
      表单内容: JSON.stringify(f.data || {}),
      提交时间: f.createdAt ? new Date(f.createdAt).toISOString() : ''
    }
  })

  const workbook = XLSX.utils.book_new()
  const patientSheet = XLSX.utils.json_to_sheet(patientRows)
  XLSX.utils.book_append_sheet(workbook, patientSheet, '医生患者')

  const formSheet = XLSX.utils.json_to_sheet(formRows)
  XLSX.utils.book_append_sheet(workbook, formSheet, '患者表单')

  const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  })

  res.setHeader(
    'Content-Disposition',
    'attachment; filename=export.xlsx'
  )
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )

  res.send(buffer)
})

app.listen(3001, () => {
  console.log('server running on 3001')
})
