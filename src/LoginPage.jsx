import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Pequeño delay para asegurar que el estado se actualiza
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 40,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 60,
              height: 60,
              margin: "0 auto 16px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            J
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", margin: "0 0 8px 0" }}>
            Jarvis
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>Personal Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0F172A", marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.15s",
                background: "#F8FAFC",
                color: "#0F172A",
              }}
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.target.style.background = "#F8FAFC";
                e.target.style.borderColor = "#E2E8F0";
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0F172A", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "all 0.15s",
                background: "#F8FAFC",
                color: "#0F172A",
              }}
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.target.style.background = "#F8FAFC";
                e.target.style.borderColor = "#E2E8F0";
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#FEE2E2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                fontSize: 13,
                color: "#991B1B",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: loading ? "#CBD5E1" : "linear-gradient(135deg, #1E3A5F, #2563EB)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              transition: "all 0.15s",
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 8px 16px rgba(37, 99, 235, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
