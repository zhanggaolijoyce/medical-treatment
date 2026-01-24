// VisitForm.jsx
import { Steps, Button } from "antd";
import { useState } from "react";
import PatientBasicForm from "./PatientBasicForm";
import BaselineForm from "./BaselineForm";
import TreatmentForm from "./TreatmentForm";
import FollowUpForm from "./FollowUpForm";

export default function VisitForm({ patientId }) {
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState({
    patient_basic: {},
    baseline: {},
    treatment: {},
    follow_ups: []
  });

  const steps = [
    {
      title: "患者基本信息",
      content: (
        <PatientBasicForm
          initialValues={data.patient_basic}
          onFinish={(values) => {
            setData({ ...data, patient_basic: values });
            setCurrent(1);
          }}
        />
      )
    },
    {
      title: "瘢痕基线情况",
      content: (
        <BaselineForm
          initialValues={data.baseline}
          onPrev={() => setCurrent(0)}
          onFinish={(values) => {
            setData({ ...data, baseline: values });
            setCurrent(2);
          }}
        />
      )
    },
    {
      title: "基线治疗方案",
      content: (
        <TreatmentForm
          initialValues={data.treatment}
          onPrev={() => setCurrent(1)}
          onFinish={(values) => {
            setData({ ...data, treatment: values });
            setCurrent(3);
          }}
        />
      )
    },
    {
      title: "随访",
      content: (
        <FollowUpForm
          value={data.follow_ups}
          baselineDate={data.baseline?.first_visit_date}
          onChange={(list) => {
            setData({ ...data, follow_ups: list });
          }}
        />
      )
    }
  ];

  return (
    <>
      <Steps current={current} items={steps.map(s => ({ title: s.title }))} />
      <div style={{ marginTop: 24 }}>{steps[current].content}</div>

      {current === 3 && (
        <Button
          type="primary"
          style={{ marginTop: 24 }}
          onClick={() => {
            if (!patientId) {
              console.warn("缺少 patientId，无法保存表单");
              return;
            }

            fetch("http://localhost:3001/form", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                patientId,
                formType: "visit",
                data
              })
            });
          }}
        >
          保存
        </Button>
      )}
    </>
  );
}
