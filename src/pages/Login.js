import { useState } from "react";
import { login } from "../api";
import "../components/ui.css";

export default function Login() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(password);
      window.location.href = "/"; // go to dashboard
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 60 }}>
      <div className="card">
        <h1 className="h1" style={{ fontSize: 34 }}>Sentinel Login</h1>
        <div className="sub">Enter admin password to access the dashboard</div>

        <div style={{ height: 16 }} />

        <form onSubmit={onSubmit} className="row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <input
            className="input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {err ? <div className="muted" style={{ color: "#ff8aa0" }}>{err}</div> : null}
        </form>
      </div>
    </div>
  );
}