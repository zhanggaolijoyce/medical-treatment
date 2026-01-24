// PatientBasicForm.jsx
import { Form, Input, Select, Radio, Checkbox, Button } from "antd";

export default function PatientBasicForm({ initialValues, onFinish }) {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Form.Item label="医院省份" name={["hospital", "province"]} rules={[{ required: true }]}>
        <Input placeholder="省" />
      </Form.Item>

      <Form.Item label="医院城市" name={["hospital", "city"]} rules={[{ required: true }]}>
        <Input placeholder="市" />
      </Form.Item>

      <Form.Item label="医院名称" name={["hospital", "name"]} rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="姓名（脱敏）" name="name_masked" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="年龄" name="age" rules={[{ required: true }]}>
        <Select options={[...Array(81)].map((_, i) => ({ value: i, label: i }))} />
      </Form.Item>

      <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="现病史（剖宫产、烧伤、整形美容互斥）" name="disease_type" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="cesarean">剖宫产手术</Radio>
          <Radio value="burn">烧伤</Radio>
          <Radio value="cosmetic">整形美容手术</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="是否有瘢痕史" name="scar_history" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue("disease_type") === "burn" && (
            <>
              <Form.Item
                label="烧伤程度"
                name={["burn_info", "degree"]}
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="shallow_II">浅 II 度</Radio>
                  <Radio value="deep_II">深 II 度</Radio>
                  <Radio value="III">III 度</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="是否接受植皮手术"
                name={["burn_info", "skin_graft"]}
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              </Form.Item>
            </>
          )
        }
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue("disease_type") !== "cesarean" && (
            <Form.Item
              label="瘢痕部位（多选）"
              name="scar_locations"
              rules={[{ required: true }]}
            >
              <Checkbox.Group
                options={[
                  "头面",
                  "颈部",
                  "耳部",
                  "上肢",
                  "手",
                  "下肢",
                  "足",
                  "前胸",
                  "腹部",
                  "后背",
                  "臀部",
                  "会阴",
                  "其他部位"
                ]}
              />
            </Form.Item>
          )
        }
      </Form.Item>

      <Button type="primary" htmlType="submit">下一步</Button>
    </Form>
  );
}
