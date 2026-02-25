const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ========= LOGIN ========= */
export async function login(password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  localStorage.setItem("token", data.token);
}

/* ========= EVENTS ========= */
export async function getEvents({ limit = 200, type = "", resolved = "", q = "" } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (type) params.set("type", type);
  if (resolved !== "") params.set("resolved", resolved);
  if (q) params.set("q", q);

  const res = await fetch(`${API}/events?${params.toString()}`, {
    headers: authHeaders()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch events");
  return data.events;
}

export async function simulateAttack() {
  const res = await fetch(`${API}/simulate-attack`, {
    method: "POST",
    headers: authHeaders()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Simulation failed");
  return data;
}

export async function resolveEvent(id, resolved) {
  const res = await fetch(`${API}/events/${id}/resolve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify({ resolved })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Resolve failed");
  return data.event;
}

export async function deleteEvent(id) {
  const res = await fetch(`${API}/events/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Delete failed");
  return true;
}

/* תאימות לשם הישן בפרויקט */
export const setResolved = resolveEvent;