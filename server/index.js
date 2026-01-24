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
    status: 'in_progress'
  },
  {
    id: 2,
    doctorId: 1,
    name: '李华',
    phone: '13900139000',
    consent: true,
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

// 1️⃣ 找到该医生的患者
const doctorPatients = patients.filter(
    p => String(p.doctorId) === String(doctorId)
)

// 2️⃣ 组装 Excel 行数据
const rows = doctorPatients.map(p => ({
    姓名: p.name,
    手机号: p.phone,
    状态: p.status === 'completed' ? '已完成' : '进行中'
}))

// 3️⃣ 创建 worksheet
const worksheet = XLSX.utils.json_to_sheet(rows)
const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, '患者数据')

// 4️⃣ 导出为 buffer
const buffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
})

// 5️⃣ 设置响应头
res.setHeader(
    'Content-Disposition',
    'attachment; filename=patients.xlsx'
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
