// VisitForm.jsx
import { Steps, Button, Tabs } from "antd";
import { useState } from "react";
import PatientBasicForm from "./PatientBasicForm";
import BaselineForm from "./BaselineForm";
import TreatmentForm from "./TreatmentForm";
import FollowUpForm from "./FollowUpForm";

export default function VisitForm({ patientId }) {
  const [current, setCurrent] = useState(0);
  const [initialComplete, setInitialComplete] = useState(false);
  const [savedFollowUpCount, setSavedFollowUpCount] = useState(0);
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
            setInitialComplete(true);
          }}
        />
      )
    }
  ];

  const saveForm = (formType, payload) => {
    if (!patientId) {
      console.warn("缺少 patientId，无法保存表单");
      return Promise.reject(new Error("missing patientId"));
    }

    return fetch("http://localhost:3001/form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        formType,
        data: payload
      })
    });
  };

  const requiredVssKeys = [
    "color",
    "thickness",
    "vascularity",
    "pliability",
    "pain",
    "itching"
  ];

  const isFollowUpComplete = (item) => {
    if (!item?.follow_up_date) return false;
    const scores = item.vss_score || {};
    const hasScores = requiredVssKeys.every((key) => typeof scores[key] === "number");
    if (!hasScores) return false;
    if (!item.images || item.images.length !== 3) return false;
    if (item.safety_has !== "yes" && item.safety_has !== "no") return false;
    if (item.safety_has === "yes") {
      const symptoms = item.safety_symptoms || [];
      if (symptoms.length === 0) return false;
      if (symptoms.includes("其他") && !item.safety_other) return false;
    }
    return true;
  };

  const canSaveFollowUp =
    data.follow_ups.length > 0 &&
    data.follow_ups.every((item) => isFollowUpComplete(item));
  const canAddFollowUp = data.follow_ups.length === savedFollowUpCount;

  return (
    <>
      <Tabs
        items={[
          {
            key: "initial",
            label: "初诊表单",
            children: (
              <>
                <div className="card">
                  <Steps current={current} items={steps.map(s => ({ title: s.title }))} />
                  <div style={{ marginTop: 20 }}>{steps[current].content}</div>
                </div>

                {current === 2 && initialComplete && (
                  <Button
                    type="primary"
                    style={{ marginTop: 24 }}
                    onClick={() =>
                      saveForm("visit", {
                        patient_basic: data.patient_basic,
                        baseline: data.baseline,
                        treatment: data.treatment
                      })
                    }
                  >
                    保存初诊
                  </Button>
                )}
              </>
            )
          },
          {
            key: "followup",
            label: "随访表单",
            children: (
              <>
                <div className="card">
                  <FollowUpForm
                    value={data.follow_ups}
                    baselineDate={data.baseline?.first_visit_date}
                    allowAdd={canAddFollowUp}
                    onChange={(list) => {
                      setData({ ...data, follow_ups: list });
                    }}
                  />
                </div>
                {canSaveFollowUp && (
                  <Button
                    type="primary"
                    style={{ marginTop: 24 }}
                    onClick={() =>
                      saveForm("follow_up", { follow_ups: data.follow_ups }).then(() => {
                        setSavedFollowUpCount(data.follow_ups.length);
                      })
                    }
                  >
                    保存随访
                  </Button>
                )}
              </>
            )
          }
        ]}
      />
    </>
  );
}
