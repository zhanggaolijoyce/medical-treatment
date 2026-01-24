// BaselineForm.jsx
import { Form, InputNumber, DatePicker, Upload, Button } from "antd";
import { useEffect } from "react";

export default function BaselineForm({ initialValues, onFinish }) {
  const [form] = Form.useForm();

  useEffect(() => {
    const values = form.getFieldValue("vss_score") || {};
    const total = Object.values(values).reduce((a, b) => a + (b || 0), 0);
    form.setFieldValue(["vss_score", "total"], total);
  });

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Form.Item label="初诊日期" name="first_visit_date" rules={[{ required: true }]}>
        <DatePicker />
      </Form.Item>

      {["color", "thickness", "vascularity", "pliability", "pain", "itching"].map(k => (
        <Form.Item key={k} label={k} name={["vss_score", k]}>
          <InputNumber min={0} />
        </Form.Item>
      ))}

      <Form.Item label="总分" name={["vss_score", "total"]}>
        <InputNumber disabled />
      </Form.Item>

      <Form.Item label="基线图片" name="images">
        <Upload listType="picture-card" />
      </Form.Item>

      <Button type="primary" htmlType="submit">下一步</Button>
    </Form>
  );
}
