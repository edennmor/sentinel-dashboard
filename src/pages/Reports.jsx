import { useEffect, useState } from "react";
import { getEvents } from "../api";

export default function Reports() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Security Events</h1>

      {events.map(e => (
        <div key={e.id} style={{
          border: "1px solid #ccc",
          margin: 10,
          padding: 10
        }}>
          <b>{e.event_type}</b><br/>
          Endpoint: {e.endpoint}<br/>
          IP: {e.ip_address}<br/>
          Time: {new Date(e.created_at).toLocaleString()}
        </div>
      ))}
    </div>
  );
}