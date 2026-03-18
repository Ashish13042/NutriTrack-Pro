"use client";

import { useState, useEffect, CSSProperties, FocusEvent, MouseEvent } from "react";

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
  icon: string;
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
}

// ── Food Database ───────────────────────────────────────────────────────────
// Per-100g for weight/volume, per-piece for unit-type foods
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
  { key: "calories", label: "Calories", unit: "kcal", color: "#f59e0b", bg: "#fffbeb", icon: "🔥" },
  { key: "protein",  label: "Protein",  unit: "g",    color: "#6366f1", bg: "#eef2ff", icon: "💪" },
  { key: "carbs",    label: "Carbs",    unit: "g",    color: "#10b981", bg: "#ecfdf5", icon: "⚡" },
  { key: "fat",      label: "Fat",      unit: "g",    color: "#ec4899", bg: "#fdf2f8", icon: "🫧" },
];

const DAILY_REF: Record<string, number> = { calories: 2000, protein: 50, carbs: 275, fat: 78 };

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

// ── MacroCard ───────────────────────────────────────────────────────────────
interface MacroCardProps {
  macro: MacroInfo;
  value: number;
  goalOverride?: number;
}

function MacroCard({ macro, value, goalOverride }: MacroCardProps) {
  const ref = goalOverride ?? DAILY_REF[macro.key];
  const pct = ref > 0 ? Math.min((value / ref) * 100, 100) : 0;
  return (
    <div style={{
      background: macro.bg, border: `1.5px solid ${macro.color}22`, borderRadius: 14,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
      animation: "fadeInUp 0.4s ease both",
    }}>
      <span style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
        {macro.icon} {macro.label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: macro.color }}>{value}</span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{macro.unit}</span>
      </div>
      <div style={{ height: 5, background: `${macro.color}22`, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: macro.color, borderRadius: 99,
          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
      <span style={{ fontSize: 10, color: "#94a3b8" }}>
        {pct.toFixed(0)}% of {goalOverride ? "protein goal" : `daily ${macro.label === "Calories" ? "goal" : "intake"}`}
      </span>
    </div>
  );
}

// ── LogItem ─────────────────────────────────────────────────────────────────
interface LogItemProps {
  entry: LogEntry;
  onRemove: () => void;
  onEdit: () => void;
}

function LogItem({ entry, onRemove, onEdit }: LogItemProps) {
  const emoji = FOOD_DB[entry.food.toLowerCase()]?.emoji || "🍽️";
  const qtyLabel = entry.type === "unit"
    ? `${entry.quantity} ${entry.quantity > 1 ? "pcs" : "pc"}`
    : `${entry.quantity} ${entry.unit}`;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", background: "#f8fafc", border: "1.5px solid #e2e8f0",
      borderRadius: 10, animation: "fadeInUp 0.3s ease both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {entry.food}
          </p>
          <p style={{ fontSize: 11, color: "#94a3b8" }}>
            {qtyLabel} · {entry.calories.toFixed(1)} kcal
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11, color: "#64748b", flexShrink: 0 }}>
        <span>P:{entry.protein.toFixed(1)}g</span>
        <span>C:{entry.carbs.toFixed(1)}g</span>
        <span>F:{entry.fat.toFixed(1)}g</span>
        <button onClick={onEdit} title="Edit"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "2px 6px", borderRadius: 6, color: "#6366f1" }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.background = "#eef2ff"}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.background = "none"}
        >✎</button>
        <button onClick={onRemove} title="Remove"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "2px 6px", borderRadius: 6, color: "#ef4444" }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.background = "#fee2e2"}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.background = "none"}
        >✕</button>
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
  const [weight, setWeight]           = useState<string>("");
  const [editIndex, setEditIndex]     = useState<number | null>(null);
  const [error, setError]             = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading]         = useState<boolean>(false);

  // ✅ Load on start
  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await fetch("/api/food");
        const data = await res.json();
        setLog(data);
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
    if (!item) { setError(`"${food}" not found. Try: chicken, egg, milk, rice…`); return null; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { setError("Please enter a valid quantity."); return null; }
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
    return { ...calc, food: itemKey, quantity: qty, unit, type: item.type };
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
        // Re-fetch to get the entry with server-assigned id
        const fetchRes = await fetch("/api/food");
        const data = await fetchRes.json();
        setLog(data);
      } catch (err) {
        console.error("Failed to add food:", err);
      }
    }
    setResult(null); setFood(""); setQuantity("");
  };

  const editItem = (index: number): void => {
    const e = log[index];
    setFood(e.food);
    setQuantity(String(e.quantity));
    setUnit(e.unit);
    setEditIndex(index);
    setResult(null);
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
        setLog(data);
      } catch (err) {
        console.error("Failed to remove food:", err);
        setLog(prev => prev.filter((_, idx) => idx !== i));
      }
    } else {
      setLog(prev => prev.filter((_, idx) => idx !== i));
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

  const proteinGoal = weight ? parseFloat(weight) * 1.6 : 0;
  const proteinProgress = proteinGoal ? Math.min((totals.protein / proteinGoal) * 100, 100) : 0;

  const popularFoods = ["chicken", "egg", "rice", "milk", "banana", "roti"];
  const unitList = getUnits();

  const getQtyPlaceholder = (): string => {
    if (!item) return "Enter quantity";
    if (item.type === "unit") return `How many? (e.g. 4 ${itemKey}s)`;
    if (item.type === "volume") return "Amount in ml";
    return "Weight in g";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f4ff 0%, #faf5ff 60%, #f0f9ff 100%)",
      display: "flex", justifyContent: "center",
      padding: "36px 16px 72px",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 540, position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(99,102,241,0.2)",
            borderRadius: 99, padding: "5px 16px", marginBottom: 14,
          }}>
            <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700 }}>🥦 NutriTrack Pro</span>
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 8,
            background: "linear-gradient(135deg, #1e293b 0%, #6366f1 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Smart Nutrition Calculator
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Track your macros &amp; hit your protein goal every day
          </p>
        </div>

        {/* ── Body Weight Card ── */}
        <div style={{
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16,
          padding: "16px 20px", marginBottom: 14,
          boxShadow: "0 2px 12px rgba(99,102,241,0.05)",
          animation: "fadeInUp 0.4s ease both",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center", background: "#eef2ff", fontSize: 18, flexShrink: 0,
          }}>🏋️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Body Weight (kg)
            </label>
            <input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              style={{
                ...INPUT_STYLE, padding: "8px 12px", fontSize: 16, fontWeight: 600,
                border: "none", background: "transparent",
              }}
              onFocus={(e: FocusEvent<HTMLInputElement>) => { e.target.style.background = "#f8fafc"; }}
              onBlur={(e: FocusEvent<HTMLInputElement>) => { e.target.style.background = "transparent"; }}
            />
          </div>
          {Number(weight) > 0 && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Protein Goal</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#6366f1" }}>{proteinGoal.toFixed(0)}g</p>
              <p style={{ fontSize: 9, color: "#94a3b8" }}>1.6 × body weight</p>
            </div>
          )}
        </div>

        {/* ── Input Card ── */}
        <div style={{
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20,
          padding: 24, marginBottom: 16,
          boxShadow: "0 4px 24px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          animation: "fadeInUp 0.5s ease both",
        }}>
          {/* Editing indicator */}
          {editIndex !== null && (
            <div style={{
              background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10,
              padding: "8px 14px", marginBottom: 14, display: "flex", alignItems: "center",
              justifyContent: "space-between", fontSize: 13,
            }}>
              <span style={{ color: "#92400e", fontWeight: 600 }}>✏️ Editing item #{editIndex + 1}</span>
              <button
                onClick={() => { setEditIndex(null); setFood(""); setQuantity(""); setResult(null); }}
                style={{ background: "none", border: "none", color: "#92400e", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}
              >Cancel</button>
            </div>
          )}

          <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 18 }}>
            {editIndex !== null ? "Edit Food Item" : "Add Food Item"}
          </p>

          {/* Food Name */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>
              Food Name
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 17, pointerEvents: "none", lineHeight: 1 }}>
                {item?.emoji || "🍽️"}
              </span>
              <input
                type="text"
                placeholder="e.g. chicken, egg, milk…"
                value={food}
                onChange={e => handleFoodChange(e.target.value)}
                onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                style={{ ...INPUT_STYLE, paddingLeft: 42, borderColor: error ? "#ef4444" : "#e2e8f0" }}
                onFocus={focusIn}
                onBlurCapture={(e: FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Type Badge */}
            {item && (
              <span style={{
                display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600,
                color: item.type === "unit" ? "#f59e0b" : item.type === "volume" ? "#3b82f6" : "#10b981",
                background: item.type === "unit" ? "#fffbeb" : item.type === "volume" ? "#eff6ff" : "#ecfdf5",
                border: `1px solid ${item.type === "unit" ? "#fde68a" : item.type === "volume" ? "#bfdbfe" : "#a7f3d0"}`,
                padding: "2px 10px", borderRadius: 99,
              }}>
                {item.type === "unit" ? "🔢 Count-based" : item.type === "volume" ? "💧 Volume-based" : "⚖️ Weight-based"}
              </span>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
                overflow: "hidden", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}>
                {suggestions.map(s => (
                  <button key={s} onMouseDown={() => selectSuggestion(s)}
                    style={{
                      width: "100%", textAlign: "left", background: "none", border: "none",
                      padding: "10px 14px", color: "#1e293b", fontSize: 14,
                      display: "flex", alignItems: "center", gap: 10,
                      cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid #f1f5f9",
                    }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = "#f0f4ff"}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = "none"}
                  >
                    <span>{FOOD_DB[s].emoji}</span>
                    <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{s}</span>
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 600,
                      color: FOOD_DB[s].type === "unit" ? "#f59e0b" : FOOD_DB[s].type === "volume" ? "#3b82f6" : "#10b981",
                      background: FOOD_DB[s].type === "unit" ? "#fffbeb" : FOOD_DB[s].type === "volume" ? "#eff6ff" : "#ecfdf5",
                      padding: "2px 8px", borderRadius: 99,
                    }}>{FOOD_DB[s].type}</span>
                    <span style={{ fontSize: 10, color: "#6366f1", background: "#eef2ff", padding: "2px 8px", borderRadius: 99, fontWeight: 500 }}>
                      {FOOD_DB[s].category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity + Unit */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: unitList.length > 0 ? "0 0 130px" : "1 1 auto" }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>
                {item?.type === "unit" ? "Count" : "Quantity"}
              </label>
              <input
                type="number" min="1"
                placeholder={getQtyPlaceholder()}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            {unitList.length > 0 && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)}
                  style={{
                    ...INPUT_STYLE, padding: "11px 30px 11px 12px", appearance: "none", cursor: "pointer",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: 15,
                  }}
                  onFocus={focusIn} onBlur={focusOut}
                >
                  {unitList.map(u => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10,
              padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 8,
            }}>⚠️ {error}</div>
          )}

          {/* Popular Foods */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Popular Foods</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {popularFoods.map(f => (
                <button key={f} onClick={() => { handleFoodChange(f); setSuggestions([]); }}
                  style={{
                    background: food.toLowerCase() === f ? "#eef2ff" : "#f8fafc",
                    border: `1.5px solid ${food.toLowerCase() === f ? "#6366f1" : "#e2e8f0"}`,
                    borderRadius: 8, padding: "5px 11px", fontSize: 12,
                    color: food.toLowerCase() === f ? "#6366f1" : "#475569",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                    transition: "all 0.18s", display: "flex", alignItems: "center", gap: 5,
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (food.toLowerCase() !== f) { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (food.toLowerCase() !== f) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}}
                >
                  {FOOD_DB[f].emoji} {f}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleCalculate} disabled={loading}
              style={{
                flex: 1, background: loading ? "#e2e8f0" : "#f8fafc",
                border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "13px",
                color: loading ? "#94a3b8" : "#1e293b", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
                fontFamily: "inherit", transition: "all 0.2s",
              }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!loading) { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (!loading) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}}
            >
              {loading
                ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #c7d2fe", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Calculating…</>
                : "🔍 Preview"}
            </button>
            <button onClick={addOrUpdate}
              style={{
                flex: 1,
                background: editIndex !== null ? "linear-gradient(135deg, #f59e0b, #f97316)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 12, padding: "13px",
                color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: 6,
                fontFamily: "inherit",
                boxShadow: editIndex !== null ? "0 4px 16px rgba(245,158,11,0.35)" : "0 4px 16px rgba(99,102,241,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.boxShadow = editIndex !== null ? "0 6px 22px rgba(245,158,11,0.5)" : "0 6px 22px rgba(99,102,241,0.5)"}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.boxShadow = editIndex !== null ? "0 4px 16px rgba(245,158,11,0.35)" : "0 4px 16px rgba(99,102,241,0.35)"}
            >
              {editIndex !== null ? "✏️ Update Food" : "✨ Add Food"}
            </button>
          </div>
        </div>

        {/* ── Preview Result ── */}
        {result && (
          <div style={{
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20,
            padding: 24, marginBottom: 16,
            boxShadow: "0 4px 24px rgba(99,102,241,0.09)",
            animation: "fadeInUp 0.4s ease both",
          }}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>
              Preview — Nutrition for
            </p>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8, textTransform: "capitalize", marginBottom: 16 }}>
              {FOOD_DB[result.food]?.emoji} {result.food}
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>
                · {result.type === "unit" ? `${result.quantity} ${result.quantity > 1 ? "pcs" : "pc"}` : `${result.quantity} ${result.unit}`}
              </span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MACROS.map(m => <MacroCard key={m.key} macro={m} value={+result[m.key].toFixed(1)} />)}
            </div>
          </div>
        )}

        {/* ── Total Intake ── */}
        {log.length > 0 && (
          <div style={{
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20,
            padding: 24, marginBottom: 16,
            boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
            animation: "fadeInUp 0.4s ease both",
          }}>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              Daily Totals
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
              {MACROS.map(m => (
                <div key={m.key} style={{ textAlign: "center", background: m.bg, borderRadius: 10, padding: "10px 4px" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{totals[m.key].toFixed(1)}</p>
                  <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Calorie Goal */}
            <div style={{ marginBottom: weight ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>
                <span>Calorie Goal</span>
                <span>{totals.calories.toFixed(0)} / {DAILY_REF.calories} kcal</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min((totals.calories / DAILY_REF.calories) * 100, 100)}%`,
                  background: "linear-gradient(90deg, #6366f1, #f59e0b)",
                  borderRadius: 99, transition: "width 0.8s ease",
                }} />
              </div>
            </div>

            {/* Protein Goal (only when body weight is entered) */}
            {proteinGoal > 0 && (
              <div style={{
                background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 12,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#4338ca", display: "flex", alignItems: "center", gap: 6 }}>
                    💪 Protein Goal
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
                    {totals.protein.toFixed(1)} / {proteinGoal.toFixed(0)}g
                  </span>
                </div>
                <div style={{ height: 8, background: "#c7d2fe", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${proteinProgress}%`,
                    background: proteinProgress >= 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    borderRadius: 99, transition: "width 0.8s ease",
                  }} />
                </div>
                <p style={{ fontSize: 10, color: "#6366f1", marginTop: 6, textAlign: "right" }}>
                  {proteinProgress >= 100 ? "✅ Goal reached!" : `${proteinProgress.toFixed(0)}% complete`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Food Log ── */}
        {log.length > 0 && (
          <div style={{
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20,
            padding: 24,
            boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
            animation: "fadeInUp 0.4s ease both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                📋 Food Log
                <span style={{ background: "#eef2ff", color: "#6366f1", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                  {log.length} item{log.length > 1 ? "s" : ""}
                </span>
              </p>
              <button onClick={async () => {
                  try {
                    await fetch("/api/food", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                  } catch (err) {
                    console.error("Failed to clear food log:", err);
                  }
                  setLog([]);
                }}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "4px 8px", borderRadius: 6, transition: "color 0.2s" }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = "#94a3b8"}
              >Clear All</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {log.map((entry, i) => (
                <LogItem key={i} entry={entry} onRemove={() => removeItem(i)} onEdit={() => editItem(i)} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 24 }}>
          Nutrition data sourced from USDA · Per-piece for count items, per 100g/100ml otherwise
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        select option { background:#fff; color:#1e293b; }
      `}</style>
    </div>
  );
}
