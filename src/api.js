const API = "http://13.53.130.40:4000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...authHeaders()
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

/* LOGIN */

export async function login(password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password })
  });

  localStorage.setItem("token", data.token);
}

/* EVENTS */

export async function getEvents({ limit = 200, type = "", resolved = "", q = "" } = {}) {
  const params = new URLSearchParams();

  params.set("limit", limit);

  if (type) params.set("type", type);
  if (resolved !== "") params.set("resolved", resolved);
  if (q) params.set("q", q);

  const data = await request(`/events?${params.toString()}`);

  return data.events;
}

/* SIMULATE ATTACK */

export async function simulateAttack() {
  return request("/simulate-attack", { method: "POST" });
}

/* RESOLVE EVENT */

export async function resolveEvent(id, resolved) {
  const data = await request(`/events/${id}/resolve`, {
    method: "PATCH",
    body: JSON.stringify({ resolved })
  });

  return data.event;
}

/* DELETE EVENT */

export async function deleteEvent(id) {
  await request(`/events/${id}`, { method: "DELETE" });
  return true;
}

export const setResolved = resolveEvent;