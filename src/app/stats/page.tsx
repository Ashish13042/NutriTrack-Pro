"use client";

import { useEffect, useState } from "react";

export default function StatsPage() {
  const [log, setLog] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/food")
      .then(res => res.json())
      .then(data => setLog(data));
  }, []);

  const totals = log.reduce((acc, e) => ({
    calories: acc.calories + e.calories,
    protein: acc.protein + e.protein,
    carbs: acc.carbs + e.carbs,
    fat: acc.fat + e.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div style={{ padding: 20 }}>
      <h2>Stats</h2>
      <p>Calories: {totals.calories.toFixed(0)}</p>
      <p>Protein: {totals.protein.toFixed(1)}g</p>
      <p>Carbs: {totals.carbs.toFixed(1)}g</p>
      <p>Fat: {totals.fat.toFixed(1)}g</p>
    </div>
  );
}