import { useState, useEffect } from "react";
import { useTradingAgent } from "./hooks/useTradingAgent.ts";
import { ethers } from "ethers";

const ASSETS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"];

function PanelWrapper({ title, icon, children, accent = "#8B5CF6", style = {} }) {
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

function StatCard({ icon, label, value, sub, accent = "#8B5CF6", positive }) {
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

function Button({ children, onClick, variant = "primary", disabled = false, style = {} }) {
  const bgColor = variant === "danger" ? "#EF4444" : variant === "success" ? "#059669" : "#8B5CF6";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#CBD5E1" : bgColor,
      color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 16px",
      fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      transition: "all .15s", ...style,
    }} onMouseEnter={(e) => !disabled && (e.target.style.opacity = "0.9")}
    onMouseLeave={(e) => (e.target.style.opacity = "1")}>
      {children}
    </button>
  );
}

function MetaMaskPanel() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask no está instalado");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const bal = await provider.getBalance(accounts[0]);
      const network = await provider.getNetwork();

      setConnected(true);
      setAccount(accounts[0]);
      setBalance(ethers.formatEther(bal));
      setChainId(network.chainId);
    } catch (e) {
      console.error("Error connecting wallet:", e);
    }
  };

  const switchToNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (e) {
      console.error("Error switching network:", e);
    }
  };

  return (
    <PanelWrapper title="MetaMask Wallet" icon="🦊" accent="#F59E0B">
      {!connected ? (
        <Button onClick={connectWallet} variant="primary">Conectar MetaMask</Button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#64748B" }}>
            <strong>Cuenta:</strong> {account?.substring(0, 10)}...{account?.substring(account.length - 8)}
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>
            <strong>Balance:</strong> {parseFloat(balance).toFixed(4)} ETH
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>
            <strong>Red:</strong> {chainId === 1 ? "Ethereum" : chainId === 56 ? "BSC" : `Chain ID: ${chainId}`}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => switchToNetwork(1)} variant="primary" style={{ fontSize: 11 }}>Ethereum</Button>
            <Button onClick={() => switchToNetwork(56)} variant="primary" style={{ fontSize: 11 }}>BSC</Button>
          </div>
          <Button onClick={() => { setConnected(false); setAccount(null); }} variant="danger">Desconectar</Button>
        </div>
      )}
    </PanelWrapper>
  );
}

function AgentStatusPanel({ status, error }) {
  const statusColors = {
    idle: "#059669",
    analyzing: "#F59E0B",
    waiting_approval: "#3B82F6",
    executing: "#8B5CF6",
    error: "#EF4444",
  };

  return (
    <PanelWrapper title="Estado del Agente" icon="🤖" accent="#8B5CF6">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 12, height: 12, borderRadius: "50%",
          background: statusColors[status] || "#CBD5E1",
          animation: status === "analyzing" ? "pulse 2s infinite" : "none",
        }}/>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
            {status === "idle" ? "Disponible" :
             status === "analyzing" ? "Analizando..." :
             status === "waiting_approval" ? "Esperando aprobación" :
             status === "executing" ? "Ejecutando" : "Error"}
          </div>
          {error && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</div>}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </PanelWrapper>
  );
}

function ConfigPanel({ configStatus, onSaveConfig }) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [autoExecute, setAutoExecute] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey || !apiSecret) {
      alert("API Key y Secret son requeridos");
      return;
    }
    setSaving(true);
    const success = await onSaveConfig(apiKey, apiSecret, autoExecute);
    if (success) {
      setApiKey("");
      setApiSecret("");
      alert("Configuración guardada");
    }
    setSaving(false);
  };

  return (
    <PanelWrapper title="Config Binance API" icon="🔐" accent="#10B981">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>
          {configStatus.configured ? "✅ Configurado" : "⚠️ No configurado"}
        </div>
        <input type="password" placeholder="API Key" value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0",
            borderRadius: 8, fontSize: 12, fontFamily: "monospace",
            boxSizing: "border-box",
          }}/>
        <input type="password" placeholder="API Secret" value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0",
            borderRadius: 8, fontSize: 12, fontFamily: "monospace",
            boxSizing: "border-box",
          }}/>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <input type="checkbox" checked={autoExecute} onChange={(e) => setAutoExecute(e.target.checked)} />
          Auto-ejecutar (confianza > 80%)
        </label>
        <Button onClick={handleSave} disabled={saving} variant="primary">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </PanelWrapper>
  );
}

function ApprovalQueuePanel({ signals, onApprove, onReject }) {
  if (!signals || signals.length === 0) {
    return (
      <PanelWrapper title="Cola de Aprobación" icon="📋" accent="#3B82F6" style={{ gridColumn: "1 / -1" }}>
        <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
          No hay señales pendientes
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper title="Cola de Aprobación" icon="📋" accent="#3B82F6" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {signals.map((signal) => (
          <div key={signal.id} style={{
            border: "1px solid #E2E8F0", borderRadius: 12, padding: 16,
            background: "#F8FAFC",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: signal.action === "buy" ? "#059669" : signal.action === "sell" ? "#EF4444" : "#F59E0B",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 12,
                }}>
                  {signal.action === "buy" ? "💰" : signal.action === "sell" ? "📉" : "⏸"}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{signal.asset}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>
                    {signal.action.toUpperCase()} @ ${parseFloat(signal.price).toFixed(2)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>
                {new Date(signal.created_at).toLocaleTimeString("es-MX")}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 12, lineHeight: 1.5 }}>
              {signal.reasoning}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={() => onApprove(signal.id)} variant="success" style={{ flex: 1 }}>
                ✓ Aprobar
              </Button>
              <Button onClick={() => onReject(signal.id)} variant="danger" style={{ flex: 1 }}>
                ✗ Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PanelWrapper>
  );
}

function StrategyPanel({ onSaveStrategy }) {
  const [name, setName] = useState("Estrategia 1");
  const [prompt, setPrompt] = useState("Si el precio sube más de 2% en 24h, compra. Si baja más de 2%, vende.");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !prompt) {
      alert("Nombre y prompt son requeridos");
      return;
    }
    setSaving(true);
    const success = await onSaveStrategy(name, prompt, active);
    if (success) {
      alert("Estrategia guardada");
    }
    setSaving(false);
  };

  return (
    <PanelWrapper title="Estrategias / Prompts" icon="🎯" accent="#EC4899">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="text" placeholder="Nombre de estrategia" value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0",
            borderRadius: 8, fontSize: 12, boxSizing: "border-box",
          }}/>
        <textarea placeholder="Descripción de la estrategia (para Claude)" value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0",
            borderRadius: 8, fontSize: 12, fontFamily: "monospace",
            minHeight: 100, boxSizing: "border-box", resize: "vertical",
          }}/>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activar esta estrategia
        </label>
        <Button onClick={handleSave} disabled={saving} variant="primary">
          {saving ? "Guardando..." : "Guardar Estrategia"}
        </Button>
      </div>
    </PanelWrapper>
  );
}

function HistoryPanel({ history, onAnalyze }) {
  return (
    <PanelWrapper title="Historial de Trades" icon="📊" accent="#06B6D4" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {ASSETS.map((asset) => (
            <Button key={asset} onClick={() => onAnalyze(asset)} variant="primary" style={{ fontSize: 11 }}>
              {asset}
            </Button>
          ))}
        </div>
      </div>

      {!history || history.length === 0 ? (
        <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
          Sin historial aún
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 12,
          }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#64748B" }}>Asset</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 600, color: "#64748B" }}>Acción</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#64748B" }}>Precio</th>
                <th style={{ textAlign: "right", padding: "8px 0", fontWeight: 600, color: "#64748B" }}>Cantidad</th>
                <th style={{ textAlign: "center", padding: "8px 0", fontWeight: 600, color: "#64748B" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((trade) => (
                <tr key={trade.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "12px 0", color: "#0F172A" }}>{trade.asset}</td>
                  <td style={{
                    padding: "12px 0", fontWeight: 600,
                    color: trade.action === "buy" ? "#059669" : trade.action === "sell" ? "#EF4444" : "#F59E0B",
                  }}>
                    {trade.action.toUpperCase()}
                  </td>
                  <td style={{ padding: "12px 0", color: "#64748B", textAlign: "right" }}>
                    ${parseFloat(trade.price).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 0", color: "#64748B", textAlign: "right" }}>
                    {parseFloat(trade.amount).toFixed(4)}
                  </td>
                  <td style={{
                    padding: "12px 0", textAlign: "center", fontWeight: 600,
                    color: trade.status === "executed" ? "#059669" : "#EF4444",
                  }}>
                    {trade.status === "executed" ? "✓" : "✗"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelWrapper>
  );
}

export default function JarvisTrading() {
  const agent = useTradingAgent();
  const { status, pendingSignals, history, configStatus, error, analyzeMarket, approveSignal, rejectSignal, saveConfig, saveStrategy } = agent;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px 40px 16px", width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
        <AgentStatusPanel status={status} error={error} />
        <MetaMaskPanel />
        <ConfigPanel configStatus={configStatus} onSaveConfig={saveConfig} />
        <StrategyPanel onSaveStrategy={saveStrategy} />
      </div>

      <ApprovalQueuePanel signals={pendingSignals} onApprove={approveSignal} onReject={rejectSignal} />

      <div style={{ marginTop: 20 }}>
        <HistoryPanel history={history} onAnalyze={analyzeMarket} />
      </div>
    </div>
  );
}
