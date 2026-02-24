import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/** ========= DB helpers ========= */
async function insertSecurityEvent({ event_type, endpoint, ip_address, details }) {
  const { data, error } = await supabase
    .from("security_events")
    .insert([{ event_type, endpoint, ip_address, details }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** ========= Canary / security middleware ========= */
const CANARY_ENDPOINTS = new Set(["/admin", "/internal", "/debug", "/.env", "/wp-admin"]);

app.use(async (req, res, next) => {
  try {
    const path = req.path;

    if (CANARY_ENDPOINTS.has(path)) {
      const ip =
        req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";

      await insertSecurityEvent({
        event_type: "unauthorized_access",
        endpoint: path,
        ip_address: ip,
        details: `method=${req.method} ua=${req.headers["user-agent"] || "n/a"}`
      });

      return res.status(404).send("Not Found");
    }

    next();
  } catch (e) {
    console.error("Canary logging failed:", e?.message || e);
    next();
  }
});

/** ========= API ========= */
app.get("/health", (req, res) => res.send("OK"));

/**
 * GET /events?limit=200&type=unauthorized_access&resolved=false&q=admin
 */
app.get("/events", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 200), 500);
    const type = (req.query.type || "").toString().trim();
    const q = (req.query.q || "").toString().trim();
    const resolvedParam = (req.query.resolved || "").toString().trim(); // "true"|"false"|""(all)

    let query = supabase
      .from("security_events")
      .select("id, created_at, event_type, endpoint, ip_address, details, resolved, resolved_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (type) query = query.eq("event_type", type);

    if (resolvedParam === "true") query = query.eq("resolved", true);
    if (resolvedParam === "false") query = query.eq("resolved", false);

    // simple search in endpoint/details/ip
    if (q) {
      // Supabase "or" filter
      query = query.or(
        `endpoint.ilike.%${q}%,details.ilike.%${q}%,ip_address.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ events: data });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
});

// POST /events (manual)
app.post("/events", async (req, res) => {
  try {
    const { event_type, endpoint, ip_address, details } = req.body || {};
    if (!event_type || !endpoint || !ip_address) {
      return res.status(400).json({ error: "Missing event_type/endpoint/ip_address" });
    }

    const row = await insertSecurityEvent({ event_type, endpoint, ip_address, details });
    res.json({ ok: true, event: row });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Insert failed" });
  }
});

// PATCH /events/:id/resolve { resolved: true|false }
app.patch("/events/:id/resolve", async (req, res) => {
  try {
    const id = req.params.id;
    const resolved = Boolean(req.body?.resolved);

    const payload = resolved
      ? { resolved: true, resolved_at: new Date().toISOString() }
      : { resolved: false, resolved_at: null };

    const { data, error } = await supabase
      .from("security_events")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true, event: data });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Resolve failed" });
  }
});

// DELETE /events/:id
app.delete("/events/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { error } = await supabase
      .from("security_events")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Delete failed" });
  }
});

// Simulate (creates 4 events)
app.post("/simulate-attack", async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const created = [];
    created.push(await insertSecurityEvent({
      event_type: "unauthorized_access",
      endpoint: "/admin",
      ip_address: ip,
      details: "simulated_canary_hit"
    }));

    created.push(await insertSecurityEvent({
      event_type: "ddos_suspected",
      endpoint: "/api/search",
      ip_address: ip,
      details: "simulated_rate_spike"
    }));

    created.push(await insertSecurityEvent({
      event_type: "failed_login",
      endpoint: "/auth/login",
      ip_address: ip,
      details: "simulated_wrong_password"
    }));

    created.push(await insertSecurityEvent({
      event_type: "sqli_suspected",
      endpoint: "/api/users",
      ip_address: ip,
      details: "simulated_payload: ' OR 1=1 --"
    }));

    res.json({ ok: true, created });
  } catch (e) {
    res.status(500).json({ error: e?.message || "Simulation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});