// TreatmentForm.jsx
import { Form, Radio, Select, Button, Space } from "antd";

export default function TreatmentForm({ initialValues, onFinish, onPrev }) {
  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Form.Item label="是否使用倍舒痕" name="use_beshun" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue("use_beshun") === true && (
            <>
              <Form.Item label="使用时长（月）" name="use_duration_month" rules={[{ required: true }]}>
                <Select options={[1, 2, 3, 6].map((v) => ({ value: v, label: v }))} />
              </Form.Item>

              <Form.Item
                label="是否是伤口愈合后即刻使用？"
                name="use_immediate"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue: getValue }) =>
                  getValue("use_immediate") === false && (
                    <Form.Item
                      label="若选择否，拆线/掉痂后多久开始使用"
                      required
                    >
                      <Space>
                        <Form.Item
                          name={["use_delay", "after"]}
                          rules={[{ required: true }]}
                          noStyle
                        >
                          <Select
                            placeholder="拆线/掉痂"
                            style={{ width: 140 }}
                            options={[
                              { value: "remove_stitches", label: "拆线后" },
                              { value: "scab_off", label: "掉痂后" }
                            ]}
                          />
                        </Form.Item>
                        <Form.Item
                          name={["use_delay", "week"]}
                          rules={[{ required: true }]}
                          noStyle
                        >
                          <Select
                            placeholder="选择周数"
                            style={{ width: 140 }}
                            options={[1, 2, 4, 8, 12].map((v) => ({
                              value: v,
                              label: `${v} 周内`
                            }))}
                          />
                        </Form.Item>
                      </Space>
                    </Form.Item>
                  )
                }
              </Form.Item>
            </>
          )
        }
      </Form.Item>

      <Space>
        <Button onClick={onPrev}>上一步</Button>
        <Button type="primary" htmlType="submit">完成初诊</Button>
      </Space>
    </Form>
  );
}
