import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/" },
  { label: "Salud",      to: "/salud" },
  { label: "Agentes IA", to: "/agentes" },
  { label: "Chat",       to: "/chat" },
  { label: "Inversiones",to: "/inversiones" },
];

const API_BASE = "https://leo-my-ai-assistant.onrender.com";

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(n) { return n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtPct(n) { return (n >= 0 ? "+" : "") + n.toFixed(2) + "%"; }

function useTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

// ─── TICKER METADATA (colores, iconos, nombres) ───────────────────────────────
const TICKER_META = {
  AAPL:  { nombre: "Apple Inc.",            tipo: "Acción", color: "#6366F1", icon: "🍎" },
  COIN:  { nombre: "Coinbase Global",        tipo: "Acción", color: "#F97316", icon: "🪙" },
  CRM:   { nombre: "Salesforce Inc.",        tipo: "Acción", color: "#2563EB", icon: "☁️" },
  CVX:   { nombre: "Chevron Corporation",    tipo: "Acción", color: "#D97706", icon: "⛽" },
  FCX:   { nombre: "Freeport-McMoRan",       tipo: "Acción", color: "#10B981", icon: "⛏️" },
  GOOGL: { nombre: "Alphabet Inc.",          tipo: "Acción", color: "#4285F4", icon: "🔍" },
  LLY:   { nombre: "Eli Lilly & Co.",        tipo: "Acción", color: "#7C3AED", icon: "💊" },
  META:  { nombre: "Meta Platforms",         tipo: "Acción", color: "#1877F2", icon: "👤" },
  NVDA:  { nombre: "NVIDIA Corporation",     tipo: "Acción", color: "#76B900", icon: "💻" },
  PLTR:  { nombre: "Palantir Technologies",  tipo: "Acción", color: "#EF4444", icon: "🔮" },
  PTON:  { nombre: "Peloton Interactive",    tipo: "Acción", color: "#EC4899", icon: "🚲" },
  SNDK:  { nombre: "SanDisk Corp.",          tipo: "Acción", color: "#059669", icon: "💾" },
  UNFI:  { nombre: "United Natural Foods",   tipo: "Acción", color: "#94A3B8", icon: "🌿" },
};

function enrichHolding(h) {
  const meta = TICKER_META[h.ticker] || { nombre: h.ticker, tipo: "Acción", color: "#2563EB", icon: "📈" };
  return {
    ...h,
    avg_price:     h.avg_cost,
    current_price: h.price ?? h.avg_cost,
    ...meta,
  };
}

// ─── FALLBACK DATA ────────────────────────────────────────────────────────────
const FALLBACK_NEWS = [
  { title: "Markets await Fed signals on rate path amid inflation data", source: "Reuters", ts: Date.now() - 3600000 },
  { title: "S&P 500 edges higher as tech leads broad rally", source: "Bloomberg", ts: Date.now() - 7200000 },
  { title: "NVDA surges on strong data-center demand outlook", source: "CNBC", ts: Date.now() - 10800000 },
  { title: "Oil steadies as OPEC+ holds production targets", source: "WSJ", ts: Date.now() - 18000000 },
  { title: "Dollar weakens ahead of key employment report", source: "FT", ts: Date.now() - 25200000 },
];

const FALLBACK_HISTORY = [
  { mes: "Oct", valor: 24100 },
  { mes: "Nov", valor: 25400 },
  { mes: "Dic", valor: 23800 },
  { mes: "Ene", valor: 26200 },
  { mes: "Feb", valor: 27500 },
  { mes: "Mar", valor: 28500 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Bar({ value, max, color = "#2563EB", height = 6 }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <div style={{ background: "rgba(148,163,184,.15)", borderRadius: 9, height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 9,
        transition: "width .6s cubic-bezier(.4,0,.2,1)" }}/>
    </div>
  );
}

function PanelWrapper({ title, icon, children, accent = "#2563EB", style = {} }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16,
      padding: "20px 22px", position: "relative", overflow: "hidden", ...style,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%",
        background: accent, borderRadius: "16px 0 0 16px" }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
          color: "#94A3B8", textTransform: "uppercase" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent = "#2563EB", positive }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14,
      padding: "16px 20px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%",
        background: accent, borderRadius: "14px 0 0 14px" }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}14`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8",
          textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>{value}</div>
      {sub !== undefined && (
        <div style={{ fontSize: 12, marginTop: 4,
          color: positive === true ? "#059669" : positive === false ? "#EF4444" : "#94A3B8",
          fontWeight: positive !== undefined ? 600 : 400 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, color = "#2563EB" }) {
  const w = 260, h = 60, pad = 8;
  const vals = data.map(d => d.valor);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const xs = vals.map((_, i) => pad + (i / (vals.length - 1)) * (w - pad * 2));
  const ys = vals.map(v => h - pad - ((v - min) / range) * (h - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const fill = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ")
    + ` L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#spGrad)"/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={i === vals.length - 1 ? 4 : 2.5}
          fill={i === vals.length - 1 ? color : "#fff"}
          stroke={color} strokeWidth="1.5"/>
      ))}
    </svg>
  );
}

function HoldingsTable({ holdings, onDelete }) {
  const [deleting, setDeleting] = useState(null);

  async function handleDelete(ticker) {
    if (!window.confirm(`¿Eliminar posición ${ticker}?`)) return;
    setDeleting(ticker);
    try {
      const res = await fetch(`${API_BASE}/api/investments/${ticker}`, { method: "DELETE" });
      if (res.ok) onDelete(ticker);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 32px",
        gap: 8, padding: "6px 10px", marginBottom: 4 }}>
        {["Activo", "Tipo", "Invertido", "Valor actual", "P&L", ""].map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: ".07em" }}>{h}</span>
        ))}
      </div>
      {holdings.map(h => {
        const invertido = h.shares * h.avg_price;
        const actual = h.shares * h.current_price;
        const pnl = actual - invertido;
        const pnlPct = (pnl / invertido) * 100;
        const pos = pnl >= 0;
        const isDeleting = deleting === h.ticker;
        return (
          <div key={h.ticker} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 32px",
            gap: 8, padding: "10px 10px", borderRadius: 9,
            transition: "background .15s",
            opacity: isDeleting ? 0.4 : 1,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            {/* Activo */}
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${h.color}14`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0 }}>{h.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{h.ticker}</div>
                <div style={{ fontSize: 11, color: "#94A3B8",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  maxWidth: 120 }}>{h.nombre}</div>
              </div>
            </div>
            {/* Tipo */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: h.color,
                background: `${h.color}14`, padding: "2px 8px", borderRadius: 6 }}>{h.tipo}</span>
            </div>
            {/* Invertido */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#475569" }}>${fmt(invertido)}</span>
            </div>
            {/* Valor actual */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>${fmt(actual)}</span>
            </div>
            {/* P&L */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700,
                color: pos ? "#059669" : "#EF4444" }}>
                {pos ? "+" : ""}${fmt(Math.abs(pnl))}
              </span>
              <span style={{ fontSize: 11, color: pos ? "#059669" : "#EF4444" }}>
                {fmtPct(pnlPct)}
              </span>
            </div>
            {/* Eliminar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button
                onClick={() => handleDelete(h.ticker)}
                disabled={isDeleting}
                title={`Eliminar ${h.ticker}`}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: "1px solid #FCA5A5",
                  background: "#FEF2F2", color: "#EF4444", fontSize: 12, fontWeight: 700,
                  cursor: isDeleting ? "not-allowed" : "pointer", lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}
                onMouseEnter={e => { if (!isDeleting) { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#EF4444"; }}
              >
                {isDeleting ? "…" : "✕"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AllocationPanel({ holdings }) {
  const totalActual = holdings.reduce((s, h) => s + h.shares * h.current_price, 0);
  return (
    <PanelWrapper title="Distribución" icon="🥧" accent="#7C3AED">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {holdings.map(h => {
          const val = h.shares * h.current_price;
          const pct = (val / totalActual) * 100;
          return (
            <div key={h.ticker}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 13 }}>{h.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{h.ticker}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>${fmt(val)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: h.color }}>{pct.toFixed(1)}%</span>
                </div>
              </div>
              <Bar value={val} max={totalActual} color={h.color} height={5}/>
            </div>
          );
        })}
      </div>
    </PanelWrapper>
  );
}

// ─── PERFORMANCE CALENDAR ────────────────────────────────────────────────────
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_LABELS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function PerformanceCalendar() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-12
  const [snapMap,   setSnapMap]   = useState({});          // "YYYY-MM-DD" → row
  const [calLoading, setCalLoading] = useState(false);
  const [selected,  setSelected]  = useState(null);        // "YYYY-MM-DD"

  useEffect(() => {
    setCalLoading(true);
    setSelected(null);
    fetch(`${API_BASE}/api/investments/history?year=${viewYear}&month=${viewMonth}`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
      .then(rows => {
        const m = {};
        rows.forEach(r => { m[r.date] = r; });
        setSnapMap(m);
        setCalLoading(false);
      });
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const ny = viewMonth === 12 ? viewYear + 1 : viewYear;
    const nm = viewMonth === 12 ? 1 : viewMonth + 1;
    if (ny > today.getFullYear() || (ny === today.getFullYear() && nm > today.getMonth() + 1)) return;
    setViewYear(ny); setViewMonth(nm);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Month summary
  const monthRows = Object.values(snapMap);
  const monthGain = monthRows.reduce((s, r) => s + (r.gain_vs_prev_day ?? 0), 0);
  const isNextDisabled = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth() + 1);

  const selRow = selected ? snapMap[selected] : null;

  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16,
      padding: "20px 22px", marginBottom: 20, position: "relative",
    }}>
      {/* Calendar header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: ".08em" }}>📅 Calendario de rendimiento</span>
          {monthRows.length > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 7,
              background: monthGain >= 0 ? "#F0FDF4" : "#FEF2F2",
              color: monthGain >= 0 ? "#059669" : "#EF4444",
              border: `1px solid ${monthGain >= 0 ? "#BBF7D0" : "#FECACA"}`,
            }}>
              {monthGain >= 0 ? "+" : ""}${fmt(monthGain)} este mes
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={prevMonth} style={{
            width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0",
            background: "#F8FAFC", color: "#475569", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", minWidth: 130, textAlign: "center" }}>
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </span>
          <button onClick={nextMonth} disabled={isNextDisabled} style={{
            width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0",
            background: isNextDisabled ? "#F8FAFC" : "#F8FAFC",
            color: isNextDisabled ? "#CBD5E1" : "#475569",
            fontSize: 13, cursor: isNextDisabled ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700,
            color: "#94A3B8", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      {calLoading ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8", fontSize: 13 }}>⏳</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`}/>;
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const snap = snapMap[dateStr];
            const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
            const isSel   = selected === dateStr;
            const hasSnap = Boolean(snap);
            const pos     = snap ? (snap.gain_vs_prev_day ?? snap.gain) >= 0 : null;
            return (
              <div key={dateStr}
                onClick={() => hasSnap && setSelected(isSel ? null : dateStr)}
                style={{
                  position: "relative", textAlign: "center",
                  padding: "6px 2px 8px",
                  borderRadius: 8,
                  background: isSel ? (pos ? "#F0FDF4" : "#FEF2F2") : "transparent",
                  border: `1px solid ${isSel ? (pos ? "#6EE7B7" : "#FCA5A5") : "transparent"}`,
                  cursor: hasSnap ? "pointer" : "default",
                  transition: "background .15s",
                }}
                onMouseEnter={e => { if (hasSnap && !isSel) e.currentTarget.style.background = "#F8FAFC"; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{
                  fontSize: 12, fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#2563EB" : "#334155",
                  background: isToday ? "#EFF6FF" : "transparent",
                  borderRadius: "50%", padding: isToday ? "1px 5px" : 0,
                }}>{day}</span>
                {hasSnap && (
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: pos ? "#10B981" : "#EF4444",
                    margin: "3px auto 0",
                  }}/>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Day detail popup */}
      {selRow && (
        <div style={{
          marginTop: 14, padding: "14px 16px", borderRadius: 10,
          background: (selRow.gain_vs_prev_day ?? selRow.gain) >= 0 ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${(selRow.gain_vs_prev_day ?? selRow.gain) >= 0 ? "#6EE7B7" : "#FCA5A5"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: ".07em", marginBottom: 2 }}>{selected}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B",
              fontFamily: "'SF Mono','Fira Code',monospace" }}>
              ${fmt(selRow.total_value)}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              Costo base: ${fmt(selRow.total_cost)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {selRow.gain_vs_prev_day !== null && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600,
                  textTransform: "uppercase", marginBottom: 2 }}>vs día anterior</div>
                <div style={{ fontSize: 15, fontWeight: 700,
                  color: selRow.gain_vs_prev_day >= 0 ? "#059669" : "#EF4444" }}>
                  {selRow.gain_vs_prev_day >= 0 ? "+" : ""}${fmt(Math.abs(selRow.gain_vs_prev_day))}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600,
                  color: selRow.gain_vs_prev_day >= 0 ? "#059669" : "#EF4444" }}>
                  {fmtPct(selRow.gain_vs_prev_day_pct)}
                </div>
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600,
                textTransform: "uppercase", marginBottom: 2 }}>vs costo base</div>
              <div style={{ fontSize: 15, fontWeight: 700,
                color: selRow.gain >= 0 ? "#059669" : "#EF4444" }}>
                {selRow.gain >= 0 ? "+" : ""}${fmt(Math.abs(selRow.gain))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600,
                color: selRow.gain >= 0 ? "#059669" : "#EF4444" }}>
                {fmtPct(selRow.gain_pct)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function NewsPanel() {
  const [news, setNews]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [source, setSource]     = useState("");

  useEffect(() => {
    async function fetchNews() {
      // 1 — Yahoo Finance
      try {
        const r = await fetch(
          "https://query1.finance.yahoo.com/v8/finance/search?q=stock+market+news&newsCount=5",
          { headers: { "Accept": "application/json" } }
        );
        if (r.ok) {
          const d = await r.json();
          const items = (d?.news || []).slice(0, 5).map(n => ({
            title:  n.title,
            source: n.publisher || "Yahoo Finance",
            link:   n.link || "#",
            ts:     (n.providerPublishTime || 0) * 1000,
          }));
          if (items.length) { setNews(items); setSource("Yahoo Finance"); return; }
        }
      } catch { /* fall through */ }

      // 2 — Google News RSS via allorigins proxy (evita CORS)
      try {
        const rssUrl = encodeURIComponent(
          "https://news.google.com/rss/search?q=stock+market&hl=es&gl=MX&ceid=MX:es"
        );
        const r = await fetch(`https://api.allorigins.win/raw?url=${rssUrl}`);
        if (r.ok) {
          const xml  = await r.text();
          const doc  = new DOMParser().parseFromString(xml, "text/xml");
          const items = Array.from(doc.querySelectorAll("item")).slice(0, 5).map(item => ({
            title:  item.querySelector("title")?.textContent || "",
            source: item.querySelector("source")?.textContent || "Google News",
            link:   item.querySelector("link")?.textContent || "#",
            ts:     new Date(item.querySelector("pubDate")?.textContent || 0).getTime(),
          }));
          if (items.length) { setNews(items); setSource("Google News"); return; }
        }
      } catch { /* fall through */ }

      // 3 — Fallback estático
      setNews(FALLBACK_NEWS);
      setSource("caché");
    }

    fetchNews().finally(() => setLoading(false));
  }, []);

  return (
    <PanelWrapper title="Noticias del mercado" icon="📰" accent="#059669">
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8", fontSize: 13 }}>
          ⏳ Cargando noticias...
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {news.map((n, i) => (
              <a key={i} href={n.link} target="_blank" rel="noreferrer"
                style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  padding: "9px 11px", borderRadius: 9,
                  background: "#F8FAFC", border: "1px solid #F1F5F9",
                  transition: "border-color .15s, background .15s", cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.background = "#F0FDF4"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#F1F5F9"; e.currentTarget.style.background = "#F8FAFC"; }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B",
                    lineHeight: 1.45, marginBottom: 5,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {n.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#059669",
                      background: "#DCFCE7", padding: "1px 7px", borderRadius: 5 }}>
                      {n.source}
                    </span>
                    <span style={{ fontSize: 10, color: "#94A3B8" }}>
                      hace {timeAgo(n.ts)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: "#CBD5E1", textAlign: "right" }}>
            Fuente: {source}
          </div>
        </>
      )}
    </PanelWrapper>
  );
}

function InsightsPanel({ holdings }) {
  const insights = [];
  if (holdings.length) {
    const best  = holdings.reduce((b, h) => h.gain_pct > b.gain_pct ? h : b, holdings[0]);
    const worst = holdings.reduce((w, h) => h.gain_pct < w.gain_pct ? h : w, holdings[0]);
    const totalVal = holdings.reduce((s, h) => s + h.value, 0);
    insights.push({ icon: "📊", text: `${best.ticker} lidera tu portafolio con ${fmtPct(best.gain_pct)} desde tu entrada.` });
    if (worst.gain_pct < 0)
      insights.push({ icon: "⚠️", text: `${worst.ticker} está en negativo (${fmtPct(worst.gain_pct)}). Evalúa si mantener o promediar a la baja.` });
    const topAlloc = holdings.reduce((b, h) => h.value > b.value ? h : b, holdings[0]);
    insights.push({ icon: "💡", text: `${topAlloc.ticker} representa el ${((topAlloc.value / totalVal) * 100).toFixed(1)}% de tu portafolio.` });
    insights.push({ icon: "🎯", text: `${holdings.length} posiciones activas · valor total $${fmt(totalVal)}.` });
  } else {
    insights.push({ icon: "⏳", text: "Cargando insights..." });
  }
  return (
    <PanelWrapper title="Insights de Jarvis" icon="🤖" accent="#2563EB">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, padding: "10px 12px",
            background: "#F8FAFC", borderRadius: 9, border: "1px solid #F1F5F9",
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{ins.icon}</span>
            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.55 }}>{ins.text}</span>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hola Leonardo 👋 Pregúntame sobre tu portafolio, rendimientos o estrategia de inversión.", time: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const t = `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text, time: t }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: "inversiones_web" }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Sin respuesta.";
      setMessages(prev => [...prev, {
        role: "assistant", text: reply,
        time: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Error de conexión.", time: "" }]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = ["¿Cómo va mi portafolio?", "¿Debería vender AAPL?", "¿Cuánto he ganado este mes?", "Recomiéndame una estrategia"];

  return (
    <PanelWrapper title="Consultar a Jarvis" icon="💬" accent="#2563EB"
      style={{ display: "flex", flexDirection: "column", minHeight: 360 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: 220, marginBottom: 12,
        display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "8px 12px", borderRadius: m.role === "user"
                ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
              background: m.role === "user"
                ? "linear-gradient(135deg,#1E3A5F,#2563EB)" : "#F1F5F9",
              color: m.role === "user" ? "#fff" : "#1E293B",
              fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
            }}>
              {m.text}
              {m.time && <div style={{ fontSize: 10, marginTop: 3, opacity: .55, textAlign: "right" }}>{m.time}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "8px 12px", background: "#F1F5F9",
            borderRadius: "12px 12px 12px 3px", width: "fit-content" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#94A3B8",
                animation: "bounce .9s infinite", animationDelay: `${i * 0.18}s` }}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setInput(s)} style={{
              padding: "4px 10px", borderRadius: 20, border: "1px solid #E2E8F0",
              background: "#F8FAFC", color: "#475569", fontSize: 11, cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#475569"; }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="Pregunta sobre inversiones…"
          style={{ flex: 1, padding: "8px 12px", borderRadius: 9, border: "1px solid #E2E8F0",
            fontSize: 13, color: "#1E293B", fontFamily: "inherit", outline: "none" }}
          onFocus={e => { e.target.style.borderColor = "#2563EB"; }}
          onBlur={e => { e.target.style.borderColor = "#E2E8F0"; }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          padding: "8px 16px", borderRadius: 9, border: "none",
          background: input.trim() && !loading ? "#2563EB" : "#E2E8F0",
          color: input.trim() && !loading ? "#fff" : "#94A3B8",
          fontSize: 13, fontWeight: 600, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
        }}>
          {loading ? "…" : "→"}
        </button>
      </div>
    </PanelWrapper>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function JarvisInversiones() {
  const now = useTime();
  const location = useLocation();

  const [holdings, setHoldings] = useState([]);
  const [stats, setStats]       = useState({ totalActual: 0, totalInvertido: 0, ganancia: 0, pct: 0 });
  const [loading, setLoading]   = useState(true);
  const [perf, setPerf]         = useState(null);

  useEffect(() => {
    const safe = (p) => p.then(r => r.ok ? r.json() : null).catch(() => null);
    Promise.all([
      safe(fetch(`${API_BASE}/api/investments`)),
      safe(fetch(`${API_BASE}/api/investments/performance`)),
    ]).then(([inv, perfData]) => {
      if (inv?.holdings?.length) {
        setHoldings(inv.holdings.map(enrichHolding));
        setStats({
          totalActual:    inv.total_value,
          totalInvertido: inv.total_cost,
          ganancia:       inv.total_gain,
          pct:            inv.total_gain_pct,
        });
      }
      if (perfData) setPerf(perfData);
      setLoading(false);
    });
  }, []);

  const best = holdings.length
    ? holdings.reduce((b, h) => h.gain_pct > b.gain_pct ? h : b, holdings[0])
    : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F0F4F8",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#fff",
            }}>J</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>Jarvis</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>Personal AI · Monterrey, MX</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 6 }}>
            {NAV_ITEMS.map(({ label, to }) => {
              const active = location.pathname === to;
              return (
                <Link key={label} to={to} style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid",
                  borderColor: active ? "#2563EB" : "#E2E8F0",
                  background: active ? "#2563EB" : "#fff",
                  color: active ? "#fff" : "#64748B",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "all .15s",
                  textDecoration: "none",
                }}>{label}</Link>
              );
            })}
          </nav>
        </div>

        {/* Performance pills */}
        {(() => {
          const pills = [
            { label: "HOY",   key: "day_gain"   },
            { label: "SEMANA", key: "week_gain"  },
            { label: "MES",   key: "month_gain"  },
            { label: "AÑO",   key: "year_gain"   },
          ];
          return (
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {pills.map(({ label, key }) => {
                const g = perf?.[key];
                const hasData = g && g.usd !== null;
                const pos = hasData ? g.usd >= 0 : null;
                const color  = pos === true ? "#059669" : pos === false ? "#EF4444" : "#94A3B8";
                const bg     = pos === true ? "#F0FDF4" : pos === false ? "#FEF2F2" : "#F8FAFC";
                const border = pos === true ? "#BBF7D0" : pos === false ? "#FECACA" : "#E2E8F0";
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 16px", borderRadius: 10,
                    background: bg, border: `1px solid ${border}`,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8",
                      textTransform: "uppercase", letterSpacing: ".08em", minWidth: 40 }}>
                      {label}
                    </span>
                    {hasData ? (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "'SF Mono','Fira Code',monospace" }}>
                          {pos ? "+" : ""}${fmt(Math.abs(g.usd))}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color }}>
                          {fmtPct(g.pct)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#CBD5E1" }}>—</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Performance calendar */}
        <PerformanceCalendar/>

        {/* Header banner */}
        <div style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1e40af 100%)",
          borderRadius: 20, padding: "28px 32px",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#93C5FD", marginBottom: 4, letterSpacing: ".05em" }}>
              Portafolio de inversión
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1,
              fontFamily: "'SF Mono','Fira Code',monospace" }}>
              {loading ? "—" : `$${fmt(stats.totalActual)}`}
              <span style={{ fontSize: 16, color: "#93C5FD", marginLeft: 6 }}>USD</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: stats.ganancia >= 0 ? "#4ADE80" : "#F87171",
              }}>
                {stats.ganancia >= 0 ? "▲" : "▼"} ${fmt(Math.abs(stats.ganancia))} ({fmtPct(stats.pct)})
              </span>
              <span style={{ fontSize: 13, color: "#BFDBFE" }}>vs costo base ${fmt(stats.totalInvertido)}</span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <Sparkline data={FALLBACK_HISTORY} color="#60A5FA"/>
            <div style={{ fontSize: 11, color: "#93C5FD", marginTop: 6 }}>Últimos 6 meses</div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <StatCard icon="💰" label="Valor actual" value={loading ? "—" : `$${fmt(stats.totalActual)}`} accent="#2563EB"/>
          <StatCard icon="📈" label="Ganancia total"
            value={loading ? "—" : `${stats.ganancia >= 0 ? "+" : ""}$${fmt(Math.abs(stats.ganancia))}`}
            sub={loading ? "" : fmtPct(stats.pct)}
            accent="#059669" positive={stats.ganancia >= 0}/>
          <StatCard icon="📦" label="Posiciones" value={loading ? "—" : holdings.length} accent="#7C3AED"/>
          <StatCard icon="🏆" label="Mejor posición"
            value={best ? best.ticker : "—"}
            sub={best ? `${fmtPct(best.gain_pct)} · $${fmt(Math.abs(best.gain))} ganados` : ""}
            accent="#10B981" positive={best ? best.gain >= 0 : undefined}/>
        </div>

        {/* Holdings table — full width */}
        <PanelWrapper title="Mis posiciones" icon="📋" accent="#2563EB" style={{ marginBottom: 16 }}>
          {loading
            ? <div style={{ textAlign: "center", padding: 24, color: "#94A3B8", fontSize: 13 }}>⏳ Cargando posiciones...</div>
            : <HoldingsTable holdings={holdings} onDelete={ticker => setHoldings(prev => prev.filter(h => h.ticker !== ticker))}/>
          }
        </PanelWrapper>

        {/* 3-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <AllocationPanel holdings={holdings}/>
          <NewsPanel/>
          <InsightsPanel holdings={holdings}/>
        </div>

        {/* Chat — full width */}
        <ChatPanel/>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#CBD5E1" }}>
          Jarvis Dashboard · Última sync: {pad(now.getHours())}:{pad(now.getMinutes())} ·
          {loading
            ? <span style={{ color: "#F59E0B", marginLeft: 6 }}>⏳ Cargando...</span>
            : <span style={{ color: "#10B981", marginLeft: 6 }}>● Conectado · {holdings.length} posiciones</span>
          }
        </div>
      </div>
    </div>
  );
}
