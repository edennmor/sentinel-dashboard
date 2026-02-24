export default function ChartPanel({ title, stats }) {
  const entries = Object.entries(stats || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));

  return (
    <div className="card">
      <div className="tableTitle" style={{ marginBottom: 10 }}>
        {title}
      </div>

      {entries.length === 0 ? (
        <div className="muted">No events yet. Click “Simulate Attack”.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 50px",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div className="mono" style={{ opacity: 0.9 }}>
                {k}
              </div>

              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.14)",
                  background: "rgba(255,255,255,.04)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(v / max) * 100}%`,
                    background:
                      "linear-gradient(90deg, rgba(90,140,255,.55), rgba(180,90,255,.35))",
                  }}
                />
              </div>

              <div className="mono" style={{ textAlign: "right", opacity: 0.85 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}