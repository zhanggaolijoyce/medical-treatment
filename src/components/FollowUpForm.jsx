// FollowUpForm.jsx
import { Button, DatePicker, InputNumber } from "antd";

export default function FollowUpForm({ value = [], onChange }) {
  const add = () => {
    onChange([...value, { follow_up_date: "", vss_score: {} }]);
  };

  return (
    <>
      {value.map((item, index) => (
        <div key={index} style={{ border: "1px solid #eee", padding: 16, marginBottom: 16 }}>
          <DatePicker
            onChange={(d) => {
              const list = [...value];
              list[index].follow_up_date = d;
              onChange(list);
            }}
          />

          <InputNumber
            placeholder="VSS 总分"
            onChange={(v) => {
              const list = [...value];
              list[index].vss_score.total = v;
              onChange(list);
            }}
          />
        </div>
      ))}

      <Button onClick={add}>新增随访</Button>
    </>
  );
}
