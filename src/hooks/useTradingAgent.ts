import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://leo-my-ai-assistant.onrender.com";

export type AgentStatus = "idle" | "analyzing" | "waiting_approval" | "executing" | "error";

export interface TradingSignal {
  id: number;
  asset: string;
  action: "buy" | "sell" | "hold";
  price: number;
  amount: number;
  reasoning: string;
  status: "pending" | "approved" | "rejected" | "executed";
  created_at: string;
}

export interface TradingConfig {
  configured: boolean;
  auto_execute: boolean;
}

export interface TradingStrategy {
  id?: number;
  name: string;
  prompt: string;
  active: boolean;
}

export function useTradingAgent() {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [pendingSignals, setPendingSignals] = useState<TradingSignal[]>([]);
  const [history, setHistory] = useState<TradingSignal[]>([]);
  const [configStatus, setConfigStatus] = useState<TradingConfig>({
    configured: false,
    auto_execute: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Refresh pending signals
  const refreshSignals = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trading/signals?status=pending&limit=10`);
      const data = await res.json();
      if (data.ok) {
        setPendingSignals(data.signals || []);
      }
    } catch (e) {
      console.error("Error refreshing signals:", e);
    }
  }, []);

  // Refresh config status
  const refreshConfigStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trading/config/status`);
      const data = await res.json();
      if (data.ok) {
        setConfigStatus({
          configured: data.configured,
          auto_execute: data.auto_execute,
        });
      }
    } catch (e) {
      console.error("Error refreshing config:", e);
    }
  }, []);

  // Refresh history
  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trading/history?limit=20`);
      const data = await res.json();
      if (data.ok) {
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error("Error refreshing history:", e);
    }
  }, []);

  // Analyze market
  const analyzeMarket = useCallback(
    async (asset: string = "BTC/USDT") => {
      try {
        setStatus("analyzing");
        setError(null);

        const res = await fetch(`${API_BASE}/api/trading/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset }),
        });

        const data = await res.json();
        if (data.ok) {
          setStatus("waiting_approval");
          await refreshSignals();
        } else {
          throw new Error(data.error || "Analysis failed");
        }
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [refreshSignals]
  );

  // Approve signal
  const approveSignal = useCallback(
    async (signalId: number) => {
      try {
        setStatus("executing");
        setError(null);

        const res = await fetch(`${API_BASE}/api/trading/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signal_id: signalId, approved: true }),
        });

        const data = await res.json();
        if (data.ok) {
          await refreshSignals();
          await refreshHistory();
          setStatus("idle");
        } else {
          throw new Error(data.error || "Execution failed");
        }
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [refreshSignals, refreshHistory]
  );

  // Reject signal
  const rejectSignal = useCallback(
    async (signalId: number) => {
      try {
        setError(null);

        const res = await fetch(`${API_BASE}/api/trading/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signal_id: signalId, approved: false }),
        });

        const data = await res.json();
        if (data.ok) {
          await refreshSignals();
          setStatus("idle");
        } else {
          throw new Error(data.error || "Rejection failed");
        }
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [refreshSignals]
  );

  // Save config
  const saveConfig = useCallback(
    async (apiKey: string, apiSecret: string, autoExecute: boolean) => {
      try {
        setError(null);

        const res = await fetch(`${API_BASE}/api/trading/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            api_secret: apiSecret,
            auto_execute: autoExecute,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          await refreshConfigStatus();
          return true;
        } else {
          throw new Error(data.error || "Config save failed");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return false;
      }
    },
    [refreshConfigStatus]
  );

  // Save strategy
  const saveStrategy = useCallback(
    async (name: string, prompt: string, active: boolean) => {
      try {
        setError(null);

        const res = await fetch(`${API_BASE}/api/trading/strategy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, prompt, active }),
        });

        const data = await res.json();
        if (data.ok) {
          return true;
        } else {
          throw new Error(data.error || "Strategy save failed");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        return false;
      }
    },
    []
  );

  // Start polling on mount
  useEffect(() => {
    refreshConfigStatus();
    refreshSignals();
    refreshHistory();

    const interval = setInterval(() => {
      refreshSignals();
      refreshHistory();
    }, 30000); // Poll every 30 seconds

    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshConfigStatus, refreshSignals, refreshHistory]);

  return {
    status,
    pendingSignals,
    history,
    configStatus,
    error,
    analyzeMarket,
    approveSignal,
    rejectSignal,
    saveConfig,
    saveStrategy,
    refreshSignals,
    refreshHistory,
    refreshConfigStatus,
  };
}
