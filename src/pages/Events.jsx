import { useEffect, useMemo, useState } from "react";
import { deleteEvent, getEvents, setResolved, simulateAttack } from "../api";
import "../components/ui.css";

function fmtLocalTime(iso) {
  return new Date(iso).toLocaleString("en-IL", { hour12: true });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [unresolved, setUnresolved] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getEvents({ q, type, unresolved, limit: 300 });
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // initial

  const typeOptions = useMemo(() => {
    const set = new Set(events.map(e => e.event_type));
    return Array.from(set).sort();
  }, [events]);

  async function onResolve(id, nextResolved) {
    try {
      setBusyId(id);
      await setResolved(id, nextResolved);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      setBusyId(id);
      await deleteEvent(id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function onSimulate() {
    setLoading(true);
    try {
      await simulateAttack();
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="h1">Security Events</h1>
          <div className="sub">Filter, resolve, and manage events</div>
        </div>

        <div className="row">
          <button className="btn primary" onClick={onSimulate} disabled={loading}>
            {loading ? "Simulating..." : "Simulate Attack"}
          </button>
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Apply / Refresh"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent:"space-between" }}>
          <div className="row">
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (type / endpoint / ip / details)"
              style={{ width: 320 }}
            />

            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label className="row" style={{ gap: 8 }}>
              <input
                type="checkbox"
                checked={unresolved}
                onChange={(e) => setUnresolved(e.target.checked)}
              />
              <span className="muted">Unresolved only</span>
            </label>
          </div>

          <div className="muted">
            Showing <b>{events.length}</b> events
          </div>
        </div>

        <div style={{ height: 12 }} />

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Endpoint</th>
              <th>IP</th>
              <th>Details</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className={e.resolved ? "resolvedRow" : ""}>
                <td>{fmtLocalTime(e.created_at)}</td>
                <td>
                  <span className={"pill " + (e.event_type === "unauthorized_access" ? "red" : "blue")}>
                    {e.event_type}
                  </span>
                  {e.resolved && <span className="pill green" style={{ marginLeft: 8 }}>resolved</span>}
                </td>
                <td>{e.endpoint}</td>
                <td>{e.ip_address}</td>
                <td className="muted">{e.details || "-"}</td>
                <td>
                  <div className="row">
                    {!e.resolved ? (
                      <button
                        className="btn ok"
                        onClick={() => onResolve(e.id, true)}
                        disabled={busyId === e.id}
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => onResolve(e.id, false)}
                        disabled={busyId === e.id}
                      >
                        Undo
                      </button>
                    )}

                    <button
                      className="btn danger"
                      onClick={() => onDelete(e.id)}
                      disabled={busyId === e.id}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">No events match the current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}