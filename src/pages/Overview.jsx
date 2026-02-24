
import { useEffect, useMemo, useState } from "react";
import { getEvents, simulateAttack, resolveEvent, deleteEvent } from "../api";
import ChartPanel from "../components/ChartPanel";
import "../App.css";

function fmtLocal(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

const TYPE_LABELS = {
  unauthorized_access: "unauthorized_access",
  ddos_suspected: "ddos_suspected",
  failed_login: "failed_login",
  sqli_suspected: "sqli_suspected",
  test_event: "test_event",
  manual_test: "manual_test",
};

export default function Overview() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filters
  const [type, setType] = useState("");
  const [resolved, setResolved] = useState(""); // "" | "true" | "false"
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await getEvents({ limit: 250, type, resolved, q });
      setEvents(data);
    } catch (e) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [type, resolved]);

  const stats = useMemo(() => {
    const total = events.length;
    const unauthorized = events.filter(
      (e) => e.event_type === "unauthorized_access"
    ).length;
    const uniqueIps = new Set(events.map((e) => e.ip_address)).size;
    return { total, unauthorized, uniqueIps };
  }, [events]);

  // ✅ Graph stats (what the ChartPanel expects)
  const chartStats = useMemo(() => {
    const counts = {};
    for (const e of events) {
      const k = e?.event_type || "unknown";
      counts[k] = (counts[k] || 0) + 1;
    }
    return counts;
  }, [events]);

  async function handleSimulate() {
    setLoading(true);
    setErr("");
    try {
      await simulateAttack();
      await load();
    } catch (e) {
      setErr(e?.message || "Simulation failed");
      setLoading(false);
    }
  }

  async function handleResolve(id, nextResolved) {
    setErr("");
    try {
      await resolveEvent(id, nextResolved);
      await load();
    } catch (e) {
      setErr(e?.message || "Resolve failed");
    }
  }

  async function handleDelete(id) {
    setErr("");
    const ok = window.confirm("Delete this event?");
    if (!ok) return;
    try {
      await deleteEvent(id);
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  }

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="brand">Sentinel</div>
          <div className="title">Events Dashboard</div>
          {/* ✅ subtitle removed as requested */}
        </div>

        <div className="topActions">
          <button
            className="btn btnPrimary"
            onClick={handleSimulate}
            disabled={loading}
          >
            Simulate Attack
          </button>
          <button className="btn btnGhost" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {err ? <div className="errorBanner">{err}</div> : null}

      <div className="cards">
        <div className="card">
          <div className="cardKicker">TOTAL EVENTS</div>
          <div className="cardBig">{stats.total}</div>
          <div className="cardSmall">All logged events</div>
        </div>
        <div className="card">
          <div className="cardKicker">UNAUTHORIZED</div>
          <div className="cardBig">{stats.unauthorized}</div>
          <div className="cardSmall">Canary hits</div>
        </div>
        <div className="card">
          <div className="cardKicker">UNIQUE IPS</div>
          <div className="cardBig">{stats.uniqueIps}</div>
          <div className="cardSmall">Distinct sources</div>
        </div>
      </div>

      {/* ✅ Graph panel (added only) */}
      <ChartPanel title="Activity (last events)" stats={chartStats} />

      <div className="filters">
        <div className="filterGroup">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            {Object.keys(TYPE_LABELS).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="filterGroup">
          <label>Status</label>
          <select value={resolved} onChange={(e) => setResolved(e.target.value)}>
            <option value="">All</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
        </div>

        <div className="filterGroup grow">
          <label>Search</label>
          <div className="searchRow">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search endpoint / details / IP"
            />
            <button className="btn btnGhost" onClick={load} disabled={loading}>
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="tableCard">
        <div className="tableHeader">
          <div className="tableTitle">Latest events</div>
          {/* ✅ tip removed as requested */}
        </div>

        <div className="tableScroll">
          <table className="eventsTable">
            <thead>
              <tr>
                <th>TIME</th>
                <th>TYPE</th>
                <th>ENDPOINT</th>
                <th>IP</th>
                <th>DETAILS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const isResolved = Boolean(e.resolved);
                return (
                  <tr key={e.id} className={isResolved ? "rowResolved" : ""}>
                    <td className="mono">{fmtLocal(e.created_at)}</td>
                    <td>
                      <span className={`pill ${e.event_type}`}>
                        {e.event_type}
                      </span>
                    </td>
                    <td className="mono">{e.endpoint}</td>
                    <td className="mono">{e.ip_address}</td>
                    <td className="muted">{e.details || "-"}</td>
                    <td className="actions">
                      <button
                        className={`btnMini ${
                          isResolved ? "btnMiniGhost" : "btnMiniOk"
                        }`}
                        onClick={() => handleResolve(e.id, !isResolved)}
                        disabled={loading}
                        title={
                          isResolved ? "Mark as unresolved" : "Mark as resolved"
                        }
                      >
                        {isResolved ? "Undo" : "Resolve"}
                      </button>
                      <button
                        className="btnMini btnMiniDanger"
                        onClick={() => handleDelete(e.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">
                    No events found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
