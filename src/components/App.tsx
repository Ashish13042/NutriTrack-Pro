"use client";

import { useState, useEffect, CSSProperties, FocusEvent, MouseEvent, useRef } from "react";
import Link from "next/link";
import { 
  Plus, 
  Home, 
  Utensils, 
  BarChart2, 
  User, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronRight,
  Flame,
  Dumbbell,
  Zap,
  Droplets
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────
interface FoodItem {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji: string;
  category: string;
  type: "weight" | "volume" | "unit";
}

interface UnitOption {
  label: string;
  multiplier: number;
}

interface MacroInfo {
  key: "calories" | "protein" | "carbs" | "fat";
  label: string;
  unit: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

interface LogEntry {
  id?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food: string;
  quantity: number;
  unit: string;
  type: "weight" | "volume" | "unit";
  timestamp?: number;
}

// ── Food Database ───────────────────────────────────────────────────────────
const FOOD_DB: Record<string, FoodItem> = {
  chicken:      { calories: 165, protein: 31,   carbs: 0,    fat: 3.6,  emoji: "🍗", category: "Protein", type: "weight" },
  egg:          { calories: 78,  protein: 6,    carbs: 0.6,  fat: 5,    emoji: "🥚", category: "Protein", type: "unit"   },
  tuna:         { calories: 116, protein: 26,   carbs: 0,    fat: 1,    emoji: "🐟", category: "Protein", type: "weight" },
  salmon:       { calories: 208, protein: 20,   carbs: 0,    fat: 13,   emoji: "🐠", category: "Protein", type: "weight" },
  beef:         { calories: 250, protein: 26,   carbs: 0,    fat: 15,   emoji: "🥩", category: "Protein", type: "weight" },
  paneer:       { calories: 265, protein: 18,   carbs: 3.4,  fat: 20,   emoji: "🧀", category: "Protein", type: "weight" },
  rice:         { calories: 130, protein: 2.7,  carbs: 28,   fat: 0.3,  emoji: "🍚", category: "Carbs",   type: "weight" },
  bread:        { calories: 80,  protein: 3,    carbs: 15,   fat: 1,    emoji: "🍞", category: "Carbs",   type: "unit"   },
  oats:         { calories: 389, protein: 17,   carbs: 66,   fat: 7,    emoji: "🌾", category: "Carbs",   type: "weight" },
  pasta:        { calories: 131, protein: 5,    carbs: 25,   fat: 1.1,  emoji: "🍝", category: "Carbs",   type: "weight" },
  banana:       { calories: 89,  protein: 1.1,  carbs: 23,   fat: 0.3,  emoji: "🍌", category: "Carbs",   type: "unit"   },
  roti:         { calories: 104, protein: 3,    carbs: 18,   fat: 3.5,  emoji: "🫓", category: "Carbs",   type: "unit"   },
  milk:         { calories: 42,  protein: 3.4,  carbs: 5,    fat: 1,    emoji: "🥛", category: "Dairy",   type: "volume" },
  yogurt:       { calories: 59,  protein: 10,   carbs: 3.6,  fat: 0.4,  emoji: "🍦", category: "Dairy",   type: "weight" },
  almonds:      { calories: 579, protein: 21,   carbs: 22,   fat: 50,   emoji: "🌰", category: "Fats",    type: "weight" },
  avocado:      { calories: 160, protein: 2,    carbs: 9,    fat: 15,   emoji: "🥑", category: "Fats",    type: "unit"   },
  peanutbutter: { calories: 588, protein: 25,   carbs: 20,   fat: 50,   emoji: "🥜", category: "Fats",    type: "weight" },
  spinach:      { calories: 23,  protein: 2.9,  carbs: 3.6,  fat: 0.4,  emoji: "🥬", category: "Veggies", type: "weight" },
  broccoli:     { calories: 34,  protein: 2.8,  carbs: 7,    fat: 0.4,  emoji: "🥦", category: "Veggies", type: "weight" },
  apple:        { calories: 52,  protein: 0.3,  carbs: 14,   fat: 0.2,  emoji: "🍎", category: "Fruit",   type: "unit"   },
};

const WEIGHT_UNITS: UnitOption[] = [
  { label: "g",  multiplier: 1 / 100 },
  { label: "kg", multiplier: 10 },
];

const VOLUME_UNITS: UnitOption[] = [
  { label: "ml",    multiplier: 1 / 100 },
  { label: "litre", multiplier: 10 },
];

const MACROS: MacroInfo[] = [
  { key: "calories", label: "Calories", unit: "kcal", color: "#f59e0b", bg: "#fffbeb", icon: <Flame size={14} /> },
  { key: "protein",  label: "Protein",  unit: "g",    color: "#6366f1", bg: "#eef2ff", icon: <Dumbbell size={14} /> },
  { key: "carbs",    label: "Carbs",    unit: "g",    color: "#10b981", bg: "#ecfdf5", icon: <Zap size={14} /> },
  { key: "fat",      label: "Fat",      unit: "g",    color: "#ec4899", bg: "#fdf2f8", icon: <Droplets size={14} /> },
];

const DAILY_REF: Record<string, number> = { calories: 2000, protein_base: 1.6, carbs: 250, fat: 78 };

// ── Shared style helpers ────────────────────────────────────────────────────
const INPUT_STYLE: CSSProperties = {
  width: "100%",
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: 12,
  color: "#1e293b",
  fontSize: 15,
  fontFamily: "'Inter', sans-serif",
  padding: "11px 14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function focusIn(e: FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = "#6366f1";
  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
}

function focusOut(e: FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.boxShadow = "none";
}

// ── Circular Progress Component ──────────────────────────────────────────────
function CircularProgress({ 
  value, 
  total, 
  label, 
  size = "lg", 
  color = "#f97316",
  unit = "g"
}: { 
  value: number; 
  total: number; 
  label: string; 
  size?: "sm" | "lg";
  color?: string;
  unit?: string;
}) {
  const percent = Math.min((value / total) * 100, 100);
  const stroke = size === "lg" ? 8 : 5;
  const radius = size === "lg" ? 65 : 45; // Slightly larger small circle for better text fit
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: "relative", width: radius * 2, height: radius * 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center", width: "100%", padding: "0 10px", boxSizing: "border-box" }}>
        <p style={{ fontSize: size === "lg" ? 22 : 14, fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.1 }}>
          {percent.toFixed(0)}%
        </p>
        <p style={{ fontSize: size === "lg" ? 9 : 8, color: "#64748b", margin: "2px 0", fontWeight: 700, textTransform: "uppercase" }}>
          {label}
        </p>
        <p style={{ fontSize: size === "lg" ? 8 : 7, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
          {value.toFixed(0)} / {total.toFixed(0)}{unit}
        </p>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [food, setFood]               = useState<string>("");
  const [quantity, setQuantity]       = useState<string>("");
  const [unit, setUnit]               = useState<string>("g");
  const [result, setResult]           = useState<LogEntry | null>(null);
  const [log, setLog]                 = useState<LogEntry[]>([]);
  const [weight, setWeight]           = useState<string>("70");
  const [editIndex, setEditIndex]     = useState<number | null>(null);
  const [error, setError]             = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading]         = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [activeTab, setActiveTab]     = useState<"today" | "weekly" | "monthly">("today");

  const addFormRef = useRef<HTMLDivElement>(null);

  // ✅ Load on start
  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await fetch("/api/food");
        const data = await res.json();
        setLog(data.map((item: LogEntry) => ({ ...item, timestamp: item.timestamp || Date.now() })));
      } catch (err) {
        console.error("Failed to fetch food log:", err);
      }
    };
    fetchLog();

    const savedWeight = localStorage.getItem("bodyWeight");
    if (savedWeight) setWeight(savedWeight);
  }, []);

  // ✅ Save weight
  useEffect(() => {
    localStorage.setItem("bodyWeight", weight);
  }, [weight]);

  const itemKey = food.toLowerCase().trim().replace(/\s+/g, "");
  const item = FOOD_DB[itemKey];

  const getUnits = (): UnitOption[] => {
    if (!item) return WEIGHT_UNITS;
    if (item.type === "weight") return WEIGHT_UNITS;
    if (item.type === "volume") return VOLUME_UNITS;
    return [];
  };

  const handleFoodChange = (val: string): void => {
    setFood(val); setError("");
    if (val.length > 0) {
      setSuggestions(Object.keys(FOOD_DB).filter(f => f.includes(val.toLowerCase())).slice(0, 5));
    } else { setSuggestions([]); }
    const key = val.toLowerCase().trim().replace(/\s+/g, "");
    const m = FOOD_DB[key];
    if (m) { setUnit(m.type === "volume" ? "ml" : "g"); }
  };

  const selectSuggestion = (name: string): void => {
    setFood(name); setSuggestions([]);
    const m = FOOD_DB[name];
    if (m) setUnit(m.type === "volume" ? "ml" : "g");
  };

  const calculateItem = (): LogEntry | null => {
    if (!item) { setError(`"${food}" not found. Try: chicken, egg…`); return null; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { setError("Enter a valid quantity."); return null; }
    setError("");

    let calc: { calories: number; protein: number; carbs: number; fat: number };
    if (item.type === "unit") {
      calc = {
        calories: item.calories * qty, protein: item.protein * qty,
        carbs: item.carbs * qty, fat: item.fat * qty,
      };
    } else if (item.type === "weight") {
      const mul = WEIGHT_UNITS.find(u => u.label === unit)?.multiplier || 0;
      calc = {
        calories: item.calories * qty * mul, protein: item.protein * qty * mul,
        carbs: item.carbs * qty * mul, fat: item.fat * qty * mul,
      };
    } else {
      const mul = VOLUME_UNITS.find(u => u.label === unit)?.multiplier || 0;
      calc = {
        calories: item.calories * qty * mul, protein: item.protein * qty * mul,
        carbs: item.carbs * qty * mul, fat: item.fat * qty * mul,
      };
    }
    return { ...calc, food: itemKey, quantity: qty, unit, type: item.type, timestamp: Date.now() };
  };

  const handleCalculate = (): void => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateItem();
      if (res) setResult(res);
      setLoading(false);
    }, 400);
  };

  const addOrUpdate = async (): Promise<void> => {
    const res = calculateItem();
    if (!res) return;
    if (editIndex !== null) {
      const updated = [...log];
      updated[editIndex] = res;
      setLog(updated);
      setEditIndex(null);
    } else {
      try {
        await fetch("/api/food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(res),
        });
        const fetchRes = await fetch("/api/food");
        const data = await fetchRes.json();
        setLog(data.map((item: LogEntry) => ({ ...item, timestamp: item.timestamp || Date.now() })));
      } catch (err) {
        console.error("Failed to add food:", err);
      }
    }
    setResult(null); setFood(""); setQuantity(""); setShowAddForm(false);
  };

  const editItem = (index: number): void => {
    const e = log[index];
    setFood(e.food);
    setQuantity(String(e.quantity));
    setUnit(e.unit);
    setEditIndex(index);
    setResult(null);
    setShowAddForm(true);
    setTimeout(() => addFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const removeItem = async (i: number): Promise<void> => {
    const entry = log[i];
    if (entry?.id) {
      try {
        await fetch("/api/food", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: entry.id }),
        });
        const fetchRes = await fetch("/api/food");
        const data = await fetchRes.json();
        setLog(data.map((item: LogEntry) => ({ ...item, timestamp: item.timestamp || Date.now() })));
      } catch (err) {
        console.error("Failed to remove food:", err);
      }
    }
  };

  const clearAllLogs = async (): Promise<void> => {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    try {
      await fetch("/api/food", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setLog([]);
    } catch (err) {
      console.error("Failed to clear logs:", err);
    }
  };

  const totals = log.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const bodyWeightNum = parseFloat(weight) || 70;
  const proteinGoal = bodyWeightNum * DAILY_REF.protein_base;
  const carbsGoal = DAILY_REF.carbs;
  const caloriesGoal = DAILY_REF.calories;

  const getFormattedTime = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const unitList = getUnits();

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      background: "#fff",
      minHeight: "100vh",
      position: "relative",
      paddingBottom: 100,
      fontFamily: "'Inter', sans-serif",
      boxShadow: "0 0 40px rgba(0,0,0,0.05)",
      overflowX: "hidden"
    }}>
      {/* ── Top Tabs ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "20px 16px 10px" }}>
        {(["today", "weekly", "monthly"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              textTransform: "capitalize",
              background: activeTab === tab ? "#f8fafc" : "transparent",
              color: activeTab === tab ? "#6366f1" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Dashboard Card ── */}
      <div style={{ padding: "10px 16px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: "20px 16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          border: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16
        }}>
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            
            <CircularProgress value={totals.protein} total={proteinGoal} label="Protein" size="sm" color="#6366f1" unit="g" />

            <CircularProgress value={totals.calories} total={caloriesGoal} label="Calories" size="lg" color="#f97316" unit="kcal" />

            <CircularProgress value={totals.carbs} total={carbsGoal} label="Carbs" size="sm" color="#10b981" unit="g" />

          </div>

          <div style={{ width: "100%", height: 1.5, background: "#f1f5f9" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: 10, borderRadius: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                <Flame size={18} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{totals.calories.toFixed(0)}</p>
                <p style={{ fontSize: 9, color: "#94a3b8", margin: 0, fontWeight: 600 }}>Burned</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: 10, borderRadius: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fdf2f8", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899" }}>
                <Droplets size={18} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{totals.fat.toFixed(1)}g</p>
                <p style={{ fontSize: 9, color: "#94a3b8", margin: 0, fontWeight: 600 }}>Total Fat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body Weight Quick Settings ── */}
      <div style={{ padding: "0 16px", marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: 16, border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚖️</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Body Weight</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="0"
              style={{ width: 40, background: "transparent", border: "none", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#6366f1", outline: "none" }}
            />
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>KG</span>
          </div>
        </div>
      </div>

      {/* ── Food Log Timeline ── */}
      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>Daily Log</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/logs" style={{ color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>View All</Link>
            <button onClick={clearAllLogs} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Clear All</button>
          </div>
        </div>

        {log.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
            <p style={{ fontSize: 14 }}>No food logged yet today.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>{getFormattedTime(entry.timestamp)}</span>
                  <div style={{ flex: 1, width: 2, background: i === log.length - 1 ? "transparent" : "#f1f5f9", margin: "4px 0" }} />
                </div>

                <div style={{
                  flex: 1,
                  background: "#f8fafc",
                  borderRadius: 20,
                  padding: "12px 16px",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #f1f5f9"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 24 }}>{FOOD_DB[entry.food.toLowerCase()]?.emoji || "🍽️"}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0, textTransform: "capitalize" }}>{entry.food}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{entry.quantity}{entry.unit} · {entry.calories.toFixed(0)} kcal</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button onClick={() => editItem(i)} style={{ background: "#fff", border: "none", color: "#94a3b8", borderRadius: 8, padding: 6, cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => removeItem(i)} style={{ background: "#fef2f2", border: "none", color: "#ef4444", borderRadius: 8, padding: 6, cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Food Form (Conditional Overlay) ── */}
      {showAddForm && (
        <div
          ref={addFormRef}
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 420,
            background: "#fff",
            zIndex: 200,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            boxShadow: "0 -10px 40px rgba(0,0,0,0.1)",
            animation: "slideUp 0.3s ease-out"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{editIndex !== null ? "Edit Item" : "Add Food"}</h3>
            <button
              onClick={() => { setShowAddForm(false); setEditIndex(null); setFood(""); setQuantity(""); setResult(null); }}
              style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Plus size={18} style={{ transform: "rotate(45deg)", color: "#64748b" }} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: 16, color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search food (chicken, egg...)"
                value={food}
                onChange={e => handleFoodChange(e.target.value)}
                style={{ ...INPUT_STYLE, paddingLeft: 40 }}
                onFocus={focusIn}
                onBlur={focusOut}
              />
              {suggestions.length > 0 && (
                <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", zIndex: 10, boxShadow: "0 -4px 12px rgba(0,0,0,0.05)", marginBottom: 8 }}>
                  {suggestions.map(s => (
                    <div key={s} onClick={() => selectSuggestion(s)} style={{ padding: "12px 14px", fontSize: 14, cursor: "pointer", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                      <span>{FOOD_DB[s].emoji} {s}</span>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                style={{ ...INPUT_STYLE, flex: 2 }}
                onFocus={focusIn}
                onBlur={focusOut}
              />
              {unitList.length > 0 && (
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ ...INPUT_STYLE, flex: 1 }}>
                  {unitList.map((u: UnitOption) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              )}
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: 12, margin: 0, fontWeight: 600 }}>{error}</p>}

            {/* Preview Results if any */}
            {result && (
              <div style={{ background: "#f0f4ff", padding: 12, borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>Preview: {result.calories.toFixed(0)} kcal</div>
                <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>P: {result.protein.toFixed(1)}g</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                onClick={handleCalculate}
                style={{ flex: 1, padding: 14, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}
              >
                Preview
              </button>
              <button
                onClick={addOrUpdate}
                style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#f97316", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}
              >
                {editIndex !== null ? "Update" : "Add to Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-around",
        padding: "16px 0",
        zIndex: 100,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#6366f1" }}>
          <Home size={22} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Home</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#94a3b8" }}>
          <Utensils size={22} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Log</span>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            position: "absolute",
            top: -24,
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "#f97316",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 6px 16px rgba(249,115,22,0.4)",
            cursor: "pointer",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = "scale(1)"}
        >
          <Plus size={24} />
        </button>

        <div style={{ width: 50 }} /> {/* Spacer for FAB */}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#94a3b8" }}>
          <BarChart2 size={22} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Stats</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "#94a3b8" }}>
          <User size={22} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Profile</span>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); }
          to { transform: translate(-50%, 0); }
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}</style>
    </div>
  );
}
