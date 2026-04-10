import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import JarvisDashboard from "./JarvisDashboard.jsx";
import JarvisSalud from "./JarvisSalud.jsx";
import JarvisAgentes from "./JarvisAgentes.jsx";
import JarvisChat from "./JarvisChat.jsx";
import JarvisMail from "./JarvisMail.jsx";
import JarvisInversiones from "./JarvisInversiones.jsx";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/" },
  { label: "Salud",      to: "/salud" },
  { label: "Agentes IA", to: "/agentes" },
  { label: "Chat",       to: "/chat" },
  { label: "Mail",       to: "/mail" },
  { label: "Inversiones",to: "/inversiones" },
];

function pad(n) { return String(n).padStart(2, "0"); }

function useTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function Navbar() {
  const location = useLocation();
  const now = useTime();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "24px 24px 0 24px", maxWidth: 1400, margin: "0 auto 20px auto", width: "100%" }}>
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
        <Navbar />
        <Routes>
          <Route path="/"            element={<JarvisDashboard />} />
          <Route path="/salud"       element={<JarvisSalud />} />
          <Route path="/agentes"     element={<JarvisAgentes />} />
          <Route path="/chat"        element={<JarvisChat />} />
          <Route path="/mail"        element={<JarvisMail />} />
          <Route path="/inversiones" element={<JarvisInversiones />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
