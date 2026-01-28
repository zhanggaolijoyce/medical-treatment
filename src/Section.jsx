import { useState } from "react";
import { apiFetch } from "./services/api";

export default function Section({ title, formType, patientId }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await apiFetch("/form", {
      method: "POST",
      body: JSON.stringify({
        patientId,
        formType,
        data: { value }
      })
    });
    setSaved(true);
  };

  return (
    <div className="card stack">
      <h3>{title}</h3>

      <textarea
        rows="4"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div>
        <button onClick={save}>保存</button>
        {saved && <span style={{ marginLeft: 10 }}>已保存</span>}
      </div>
    </div>
  );
}
