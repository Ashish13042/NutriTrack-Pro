"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trash2, Edit3 } from "lucide-react";

interface LogEntry {
  id: number;
  food: string;
  quantity: number;
  unit: string;
  calories: number;
  timestamp: number;
}

const FOOD_DB_EMOJI: Record<string, string> = {
  chicken: "🍗", egg: "🥚", tuna: "🐟", salmon: "🐠", beef: "🥩",
  paneer: "🧀", rice: "🍚", bread: "🍞", oats: "🌾", pasta: "🍝",
  banana: "🍌", roti: "🫓", milk: "🥛", yogurt: "🍦", almonds: "🌰",
  avocado: "🥑", peanutbutter: "🥜", spinach: "🥬", broccoli: "🥦", apple: "🍎",
  daal: "🍲", soyachunks: "🥘", curd: "🥣"
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/food");
      const data = await res.json();
      setLogs(data.map((item: any) => ({ ...item, timestamp: item.timestamp || Date.now() })));
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const removeLog = async (id: number) => {
    try {
      await fetch("/api/food", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchLogs();
    } catch (err) {
      console.error("Failed to remove log:", err);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    try {
      await fetch("/api/food", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      background: "#fff",
      minHeight: "100vh",
      padding: "24px 20px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <Link href="/" style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          <ChevronLeft size={18} /> Back
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>All Logs</h1>
        <button onClick={clearAll} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Clear All
        </button>
      </div>

      {logs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 0", color: "#94a3b8" }}>
          <p style={{ fontSize: 16 }}>No activity found yet.</p>
          <Link href="/" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Add something today</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {logs.sort((a, b) => b.timestamp - a.timestamp).map((entry) => (
            <div key={entry.id} style={{
              background: "#f8fafc",
              borderRadius: 20,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28 }}>{FOOD_DB_EMOJI[entry.food.toLowerCase()] || "🍴"}</div>
                <div>
                   <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 2px", textTransform: "capitalize" }}>{entry.food}</p>
                   <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    {entry.quantity}{entry.unit} · {entry.calories.toFixed(0)} kcal · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
              </div>
              <button onClick={() => removeLog(entry.id)} style={{ background: "#fef2f2", border: "none", color: "#ef4444", borderRadius: 10, padding: 8, cursor: "pointer" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
