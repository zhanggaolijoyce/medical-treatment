// FollowUpForm.jsx
import { Button, DatePicker, Radio, Upload, Input, Checkbox } from "antd";
import dayjs from "dayjs";

export default function FollowUpForm({ value = [], onChange, baselineDate }) {
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
  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const updateItem = (index, patch) => {
    const list = [...value];
    list[index] = { ...list[index], ...patch };
    onChange(list);
  };

  const updateVssScore = (index, key, score) => {
    const current = value[index]?.vss_score || {};
    const next = { ...current, [key]: score };
    const { total: _ignored, ...scores } = next;
    const total = Object.values(scores).reduce((sum, v) => sum + (v || 0), 0);
    updateItem(index, { vss_score: { ...next, total } });
  };

  const getFollowUpWindow = () => {
    const base = dayjs(baselineDate);
    if (!baselineDate || !base.isValid()) return null;
    const target = base.add(3, "month");
    return {
      min: target.subtract(1, "week").startOf("day"),
      max: target.add(1, "week").endOf("day")
    };
  };

  const followUpWindow = getFollowUpWindow();

  const disableOutsideWindow = (current) => {
    if (!followUpWindow) return false;
    return current.isBefore(followUpWindow.min) || current.isAfter(followUpWindow.max);
  };

  const add = () => {
    onChange([...value, { follow_up_date: "", vss_score: {} }]);
  };

  return (
    <>
      {value.map((item, index) => (
        <div key={index} style={{ border: "1px solid #eee", padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>复诊日期（距初诊 3 个月 ± 1 周）</div>
          <DatePicker
            disabledDate={disableOutsideWindow}
            value={item.follow_up_date || null}
            onChange={(d) => updateItem(index, { follow_up_date: d })}
          />

          <div style={{ marginTop: 16, marginBottom: 8 }}>
            改良 VSS 评分（共 6 项，评分越高瘢痕越严重）
          </div>
          <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>
            改良 VSS 量表评定建议由医生、护士等医药卫生专业人士进行，且量表评估全程由同一人进行
          </div>

          {vssFields.map((field) => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}>{field.label}</div>
              <Radio.Group
                options={field.options}
                value={item.vss_score?.[field.key]}
                onChange={(e) => updateVssScore(index, field.key, e.target.value)}
              />
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            总分：{item.vss_score?.total || 0}
          </div>

          <div style={{ marginBottom: 8 }}>瘢痕图片（3张，高清，正面，拍摄全貌）</div>
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            accept="image/*"
            multiple
            maxCount={3}
            fileList={item.images || []}
            onChange={(e) => updateItem(index, { images: normFile(e) })}
          >
            <Button type="dashed">上传图片</Button>
          </Upload>

          <div style={{ marginTop: 16 }}>安全性信息记录</div>
          <Radio.Group
            value={item.safety_has}
            onChange={(e) => updateItem(index, { safety_has: e.target.value })}
          >
            <Radio value="yes">有</Radio>
            <Radio value="no">无</Radio>
          </Radio.Group>

          {item.safety_has === "yes" && (
            <>
              <div style={{ marginTop: 12, marginBottom: 6 }}>症状（可多选）</div>
              <Checkbox.Group
                options={["红肿", "瘙痒", "其他"]}
                value={item.safety_symptoms || []}
                onChange={(list) => updateItem(index, { safety_symptoms: list })}
              />
              {(item.safety_symptoms || []).includes("其他") && (
                <div style={{ marginTop: 8 }}>
                  <Input
                    placeholder="其他说明"
                    value={item.safety_other || ""}
                    onChange={(e) => updateItem(index, { safety_other: e.target.value })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ))}

      <Button onClick={add}>新增随访</Button>
    </>
  );
}
