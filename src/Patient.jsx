import { useState } from "react";
import { Steps, Form, Input, Button, Select } from "antd";
import { apiFetch } from "./services/api";

export default function Patient() {
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get("doctorId");

  const [current, setCurrent] = useState(0);
  const [basicInfo, setBasicInfo] = useState(null);
  const [consentSigned, setConsentSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [form] = Form.useForm();

  const nextStep = async () => {
    try {
      const values = await form.validateFields();
      setBasicInfo(values);
      setCurrent(1);
    } catch (e) {
      // validation errors handled by antd
    }
  };

  const categoryLabel = basicInfo?.category === "child" ? "儿童" : "成年人";

  const submit = async () => {
    if (!consentSigned) {
      alert("请先同意并签署");
      return;
    }
    if (!basicInfo) {
      alert("请先填写基本信息");
      setCurrent(0);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/patient", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          name: basicInfo.name,
          phone: basicInfo.phone,
          category: basicInfo.category,
          consentSigned: true,
          consentName: basicInfo.name,
          consentPhone: basicInfo.phone,
          consentTextVersion: "v1"
        })
      });

      if (!res.ok) {
        alert("提交失败");
        return;
      }

      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctorId) {
    return <div className="page">缺少 doctorId，请使用医生二维码进入。</div>;
  }

  return (
    <div className="page">
      <div className="card stack">
        <h2>患者注册</h2>
        <div className="subtitle">请填写真实信息，便于医生联系。</div>

        <Steps
          current={current}
          items={[{ title: "基本信息" }, { title: "知情同意" }]}
        />

        {completed ? (
          <div className="stack" style={{ marginTop: 16 }}>
            <div className="consent-box">
              您已完成注册，医生将尽快与您联系。
            </div>
            <Button type="primary" onClick={() => window.close?.()}>
              关闭页面
            </Button>
          </div>
        ) : (
          <>
            {current === 0 && (
              <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item
                  label="患者姓名"
                  name="name"
                  rules={[{ required: true, message: "请输入姓名" }]}
                >
                  <Input placeholder="请输入姓名" />
                </Form.Item>
                <Form.Item
                  label="手机号"
                  name="phone"
                  rules={[
                    { required: true, message: "请输入手机号" },
                    { pattern: /^1\d{10}$/, message: "请输入正确的手机号" }
                  ]}
                >
                  <Input placeholder="请输入手机号" />
                </Form.Item>
                <Form.Item
                  label="类别"
                  name="category"
                  rules={[{ required: true, message: "请选择类别" }]}
                >
                  <Select
                    placeholder="请选择类别"
                    options={[
                      { value: "adult", label: "成年人" },
                      { value: "child", label: "儿童" }
                    ]}
                  />
                </Form.Item>
                <Button type="primary" onClick={nextStep}>
                  下一步
                </Button>
              </Form>
            )}

            {current === 1 && (
              <div className="stack" style={{ marginTop: 16 }}>
                <div className="consent-box">
                  <div>我知情并同意。</div>
                  <div>{categoryLabel}受试者签名：{basicInfo?.name || "-"}</div>
                  <div>{categoryLabel}受试者电话：{basicInfo?.phone || "-"}</div>
                </div>

                <div className="button-row">
                  <Button onClick={() => setCurrent(0)}>上一步</Button>
                  <Button
                    onClick={() => {
                      setConsentSigned(true);
                    }}
                    disabled={consentSigned}
                  >
                    同意并签署
                  </Button>
                  <Button
                    type="primary"
                    loading={submitting}
                    onClick={submit}
                    disabled={!consentSigned}
                  >
                    提交
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
