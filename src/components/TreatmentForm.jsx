// TreatmentForm.jsx
import { Form, Radio, Select, Button } from "antd";

export default function TreatmentForm({ initialValues, onFinish }) {
  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Form.Item label="是否使用倍舒痕" name="use_beshun">
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="使用时长（月）" name="use_duration_month">
        <Select options={[1, 2, 3, 6].map(v => ({ value: v }))} />
      </Form.Item>

      <Button type="primary" htmlType="submit">下一步</Button>
    </Form>
  );
}
