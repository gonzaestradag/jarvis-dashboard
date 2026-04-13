import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import JarvisDashboard from "./JarvisDashboard.jsx";
import JarvisSalud from "./JarvisSalud.jsx";
import JarvisAgentes from "./JarvisAgentes.jsx";
import JarvisChat from "./JarvisChat.jsx";
import JarvisMail from "./JarvisMail.jsx";
import JarvisInversiones from "./JarvisInversiones.jsx";
import JarvisTrading from "./JarvisTrading.jsx";
import LoginPage from "./LoginPage.jsx";
import { useAuth } from "./hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/" },
  { label: "Salud",      to: "/salud" },
  { label: "Agentes IA", to: "/agentes" },
  { label: "Chat",       to: "/chat" },
  { label: "Mail",       to: "/mail" },
  { label: "Inversiones",to: "/inversiones" },
  { label: "Trading",    to: "/trading" },
];

function pad(n) { return String(n).padStart(2, "0"); }

function useTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function Navbar({ isAuthenticated, onLogout }) {
  const location = useLocation();
  const now = useTime();

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "20px 16px 0 16px", maxWidth: 1400, margin: "0 auto 20px auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
        }}>J</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>Jarvis</div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Personal AI · Monterrey, MX</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {NAV_ITEMS.map(({ label, to }) => {
          const active = location.pathname === to;
          return (
            <Link key={label} to={to} style={{
              padding: "5px 11px", borderRadius: 6, border: "1px solid",
              borderColor: active ? "#2563EB" : "#E2E8F0",
              background: active ? "#2563EB" : "#fff",
              color: active ? "#fff" : "#64748B",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              transition: "all .15s",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}>{label}</Link>
          );
        })}
        <div style={{ width: "1px", height: 24, background: "#E2E8F0", margin: "0 4px" }} />
        <button
          onClick={onLogout}
          style={{
            padding: "5px 11px",
            borderRadius: 6,
            border: "1px solid #E2E8F0",
            background: "#fff",
            color: "#64748B",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#FEE2E2";
            e.target.style.borderColor = "#FECACA";
            e.target.style.color = "#991B1B";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#fff";
            e.target.style.borderColor = "#E2E8F0";
            e.target.style.color = "#64748B";
          }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

function PrivateRoute({ children, isAuthenticated, loading }) {
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 16, color: "#64748B" }}>Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const { isAuthenticated, loading, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
      <Navbar isAuthenticated={isAuthenticated} onLogout={logout} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisDashboard /></PrivateRoute>} />
        <Route path="/salud" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisSalud /></PrivateRoute>} />
        <Route path="/agentes" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisAgentes /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisChat /></PrivateRoute>} />
        <Route path="/mail" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisMail /></PrivateRoute>} />
        <Route path="/inversiones" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisInversiones /></PrivateRoute>} />
        <Route path="/trading" element={<PrivateRoute isAuthenticated={isAuthenticated} loading={loading}><JarvisTrading /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
