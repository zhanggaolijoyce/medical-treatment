import { useEffect, useState } from "react";

/**
 * 通用访视表单
 * @param {string} patientId
 * @param {string} doctorId
 * @param {string} type - baseline | visit1 | visit2 ...
 */
export default function VisitForm({ patientId, doctorId, type }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // ===== 初始化模板 =====
  const getInitialData = () => {
    if (type === "baseline") {
      return {
        age: "",
        gender: "",
        diagnosis: "",
        treatmentPlan: "",
        startDate: "",
        remark: "",
      };
    }

    return {
      visitDate: "",
      score: "",
      treatment: "",
      adverseEvent: "",
      images: [],
      remark: "",
    };
  };

  // ===== 拉取已有数据 =====
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3001/form?patientId=${patientId}&type=${type}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.data) {
            setFormData(data.data);
            setSaved(data.completed);
            return;
          }
        }
        setFormData(getInitialData());
      } catch (e) {
        setFormData(getInitialData());
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [patientId, type]);

  // ===== 表单更新 =====
  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // ===== 保存 =====
  const saveForm = async () => {
    try {
      const res = await fetch("http://localhost:3001/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId,
          type,
          data: formData,
        }),
      });

      if (res.ok) {
        setSaved(true);
        alert("保存成功");
      } else {
        alert("保存失败");
      }
    } catch (e) {
      alert("无法连接服务器");
    }
  };

  if (loading) {
    return <div style={{ padding: 12 }}>加载中...</div>;
  }

  return (
    <div style={styles.card}>
      <h3>
        {type === "baseline" ? "基线信息" : `访视 ${type.replace("visit", "")}`}
        {saved && <span style={styles.done}> ✔ 已完成</span>}
      </h3>

      {/* ===== 基线表 ===== */}
      {type === "baseline" && (
        <>
          <Input label="年龄" value={formData.age} onChange={(v) => updateField("age", v)} />
          <Input label="性别" value={formData.gender} onChange={(v) => updateField("gender", v)} />
          <Input label="诊断" value={formData.diagnosis} onChange={(v) => updateField("diagnosis", v)} />
          <Input label="治疗方案" value={formData.treatmentPlan} onChange={(v) => updateField("treatmentPlan", v)} />
          <Input label="开始日期" type="date" value={formData.startDate} onChange={(v) => updateField("startDate", v)} />
          <Textarea label="备注" value={formData.remark} onChange={(v) => updateField("remark", v)} />
        </>
      )}

      {/* ===== 访视表 ===== */}
      {type !== "baseline" && (
        <>
          <Input label="访视日期" type="date" value={formData.visitDate} onChange={(v) => updateField("visitDate", v)} />
          <Input label="评分" value={formData.score} onChange={(v) => updateField("score", v)} />
          <Input label="治疗方案" value={formData.treatment} onChange={(v) => updateField("treatment", v)} />
          <Input label="不良反应" value={formData.adverseEvent} onChange={(v) => updateField("adverseEvent", v)} />
          <Textarea label="备注" value={formData.remark} onChange={(v) => updateField("remark", v)} />
        </>
      )}

      <button onClick={saveForm} style={styles.saveBtn}>
        保存
      </button>
    </div>
  );
}

/* ===== 小组件 ===== */

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div style={styles.field}>
      <div style={styles.label}>{label}</div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div style={styles.field}>
      <div style={styles.label}>{label}</div>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={styles.textarea}
      />
    </div>
  );
}

/* ===== 样式 ===== */

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  done: {
    color: "green",
    fontSize: 14,
    marginLeft: 8,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: 8,
  },
  textarea: {
    width: "100%",
    padding: 8,
    minHeight: 60,
  },
  saveBtn: {
    marginTop: 12,
    padding: "8px 16px",
  },
};
