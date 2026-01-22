import { useState } from 'react'

export default function Patient() {
  const params = new URLSearchParams(window.location.search)
  const doctorId = params.get('doctorId')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)

  const submit = async () => {
    if (!name || !phone || !consent) {
      alert('请填写完整并勾选同意')
      return
    }

    const res = await fetch('http://localhost:3001/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId,
        name,
        phone,
        consent
      })
    })

    if (!res.ok) {
      alert('提交失败')
      return
    }

    // 👉 问卷星链接（先用一个占位）
    window.location.href =
      'https://www.wjx.top/vm/Pwx77fd.aspx'
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>患者信息填写</h2>

      <div>
        <input
          placeholder="姓名"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div>
        <input
          placeholder="手机号"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
          />
          我已阅读并同意
        </label>
      </div>

      <button onClick={submit}>提交并进入问卷</button>
    </div>
  )
}
