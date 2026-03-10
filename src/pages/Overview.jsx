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
  const [events, setEvents] = useState([]); // תמיד מערך
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [type, setType] = useState("");
  const [resolved, setResolved] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const data = await getEvents({ limit: 250, type, resolved, q });

      // תיקון הקריסה
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (e) {
      setErr(e?.message || "Failed to load");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [type, resolved]);

  const stats = useMemo(() => {
    const safeEvents = events || [];

    const total = safeEvents.length;

    const unauthorized = safeEvents.filter(
      (e) => e?.event_type === "unauthorized_access"
    ).length;

    const uniqueIps = new Set(
      safeEvents.map((e) => e?.ip_address).filter(Boolean)
    ).size;

    return { total, unauthorized, uniqueIps };
  }, [events]);

  const chartStats = useMemo(() => {
    const counts = {};
    const safeEvents = events || [];

    for (const e of safeEvents) {
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
    } finally {
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
              {(events || []).map((e) => {
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
                      >
                        {isResolved ? "Undo" : "Resolve"}
                      </button>

                      <button
                        className="btnMini btnMiniDanger"
                        onClick={() => handleDelete(e.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {(events || []).length === 0 ? (
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