"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [weight, setWeight] = useState("70");

  useEffect(() => {
    const saved = localStorage.getItem("bodyWeight");
    if (saved) setWeight(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("bodyWeight", weight);
  }, [weight]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>

      <div style={{ marginTop: 20 }}>
        <label>Body Weight (kg)</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{
            display: "block",
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc"
          }}
        />
      </div>
    </div>
  );
}