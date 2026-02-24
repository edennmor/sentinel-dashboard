export default function TopBar({ onRefresh, onSimulate }) {
  return (
    <div className="topbar">
      <div>
        <div className="brand">Sentinel Security Dashboard</div>
        <div className="subtitle">Canary + DDoS + Brute Force + SQLi suspicion</div>
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={onRefresh}>Refresh</button>
        <button className="btn" onClick={onSimulate}>Simulate Attack</button>
      </div>
    </div>
  );
}