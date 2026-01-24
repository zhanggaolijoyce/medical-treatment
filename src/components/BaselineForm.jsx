// BaselineForm.jsx
import { Form, DatePicker, Upload, Button, Space, Radio, Input, Checkbox } from "antd";
import { useEffect } from "react";

export default function BaselineForm({ initialValues, onFinish, onPrev }) {
  const [form] = Form.useForm();
  const vssFields = [
    {
      key: "color",
      label: "色泽",
      options: [
        { value: 0, label: "0 与正常皮肤色泽近似" },
        { value: 1, label: "1 色泽较浅" },
        { value: 2, label: "2 混合色泽" },
        { value: 3, label: "3 色泽较深" }
      ]
    },
    {
      key: "thickness",
      label: "厚度",
      options: [
        { value: 0, label: "0 正常" },
        { value: 1, label: "1 高于正常皮肤≤2mm" },
        { value: 2, label: "2 >2mm, ≤5mm" },
        { value: 3, label: "3 高于正常皮肤≥5mm" }
      ]
    },
    {
      key: "vascularity",
      label: "血管分布",
      options: [
        { value: 0, label: "0 与正常部位近似" },
        { value: 1, label: "1 肤色偏粉红，局部血供略高" },
        { value: 2, label: "2 肤色偏红，局部血供明显增高" },
        { value: 3, label: "3 肤色呈紫色，血供丰富" }
      ]
    },
    {
      key: "pliability",
      label: "柔软度",
      options: [
        { value: 0, label: "0 正常" },
        { value: 1, label: "1 柔软（最小阻力下能变形）" },
        { value: 2, label: "2 柔顺（压力下能变形）" },
        { value: 3, label: "3 质硬（呈块状，不能变形，有对抗阻力）" },
        { value: 4, label: "4 弯曲（呈绳状，伸展时会退缩）" },
        { value: 5, label: "5 挛缩（永久性短缩导致残废与畸形）" }
      ]
    },
    {
      key: "pain",
      label: "疼痛",
      options: [
        { value: 0, label: "0 无痛" },
        { value: 1, label: "1 偶尔或轻微痛" },
        { value: 2, label: "2 需要药物" }
      ]
    },
    {
      key: "itching",
      label: "瘙痒",
      options: [
        { value: 0, label: "0 无" },
        { value: 1, label: "1 偶尔或轻微瘙痒" },
        { value: 2, label: "2 需要药物" }
      ]
    }
  ];
  const vssValues = Form.useWatch("vss_score", form) || {};
  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  useEffect(() => {
    const { total: _ignored, ...scores } = vssValues || {};
    const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
    const currentTotal = form.getFieldValue(["vss_score", "total"]) || 0;
    if (total !== currentTotal) {
      form.setFieldValue(["vss_score", "total"], total);
    }
  }, [form, vssValues]);

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Form.Item label="初诊日期" name="first_visit_date" rules={[{ required: true }]}>
        <DatePicker />
      </Form.Item>

      <div style={{ marginBottom: 16 }}>
        <div>改良 VSS 评分（共 6 项，评分越高瘢痕越严重）</div>
        <div style={{ color: "#666", fontSize: 12 }}>
          改良 VSS 量表评定建议由医生、护士等医药卫生专业人士进行，且量表评估全程由同一人进行
        </div>
      </div>

      {vssFields.map((field) => (
        <Form.Item
          key={field.key}
          label={field.label}
          name={["vss_score", field.key]}
          rules={[{ required: true }]}
        >
          <Radio.Group options={field.options} />
        </Form.Item>
      ))}

      <Form.Item label="总分" shouldUpdate>
        {() => {
          const total = form.getFieldValue(["vss_score", "total"]) || 0;
          return <div>{total}</div>;
        }}
      </Form.Item>
      <Form.Item name={["vss_score", "total"]} hidden>
        <Input />
      </Form.Item>

      <Form.Item
        label="基线图片（3张，高清，正面，拍摄全貌）"
        name="images"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[
          {
            validator: (_, fileList) => {
              if (!fileList || fileList.length !== 3) {
                return Promise.reject(new Error("请上传 3 张图片"));
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <Upload
          listType="picture-card"
          beforeUpload={() => false}
          accept="image/*"
          multiple
          maxCount={3}
        >
          <Button type="dashed">上传图片</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="安全性信息记录" name="safety_has" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="yes">有</Radio>
          <Radio value="no">无</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue("safety_has") === "yes" && (
            <>
              <Form.Item
                label="症状（可多选）"
                name="safety_symptoms"
                rules={[{ required: true }]}
              >
                <Checkbox.Group options={["红肿", "瘙痒", "其他"]} />
              </Form.Item>

              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue: getValue }) =>
                  (getValue("safety_symptoms") || []).includes("其他") && (
                    <Form.Item label="其他说明" name="safety_other">
                      <Input />
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
        <Button type="primary" htmlType="submit">下一步</Button>
      </Space>
    </Form>
  );
}
