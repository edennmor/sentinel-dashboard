export default function EventsTable({ events }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Endpoint</th>
            <th>IP</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {events.slice(0, 200).map((e) => (
            <tr key={e.id}>
              <td className="mono">{(e.created_at || "").replace("T", " ").slice(0, 19)}</td>
              <td>
                <span className={`pill pill-${(e.event_type || "unknown").toLowerCase()}`}>
                  {e.event_type || "unknown"}
                </span>
              </td>
              <td className="mono">{e.endpoint}</td>
              <td className="mono">{e.ip_address}</td>
              <td className="muted">{e.details || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}