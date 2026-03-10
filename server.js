import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;
const JWT_SECRET = "supersecret";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function insertSecurityEvent({ event_type, endpoint, ip_address, details }) {
  const { data, error } = await supabase
    .from("security_events")
    .insert([{ event_type, endpoint, ip_address, details }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

///////////////////////////
// HELPER: GET REAL IP
///////////////////////////

function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

///////////////////////////
// RATE LIMIT DETECTION
///////////////////////////

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  handler: async (req, res) => {
    const ip = getIP(req);

    await insertSecurityEvent({
      event_type: "ddos_suspected",
      endpoint: req.path,
      ip_address: ip,
      details: "rate limit exceeded"
    });

    res.status(429).send("Too many requests");
  }
});

app.use(limiter);

///////////////////////////
// SCAN DETECTION
///////////////////////////

const scanAttempts = new Map();

app.use((req, res, next) => {

  const ip = getIP(req);

  const now = Date.now();
  const attempts = scanAttempts.get(ip) || [];

  const recent = attempts.filter(t => now - t < 10000);
  recent.push(now);

  scanAttempts.set(ip, recent);

  if (recent.length > 10) {

    insertSecurityEvent({
      event_type: "scanner_detected",
      endpoint: req.path,
      ip_address: ip,
      details: "multiple endpoint scan"
    }).catch(() => {});
  }

  next();
});

///////////////////////////
// LOGIN
///////////////////////////

app.post("/auth/login", (req, res) => {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });

  res.json({ token });
});

///////////////////////////
// AUTH MIDDLEWARE
///////////////////////////

function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = header.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

///////////////////////////
// CANARY ENDPOINTS
///////////////////////////

const CANARY_ENDPOINTS = new Set([
  "/admin",
  "/internal",
  "/debug",
  "/.env"
]);

app.use(async (req, res, next) => {

  if (CANARY_ENDPOINTS.has(req.path)) {

    const ip = getIP(req);

    try {
      await insertSecurityEvent({
        event_type: "unauthorized_access",
        endpoint: req.path,
        ip_address: ip,
        details: "canary triggered"
      });
    } catch (e) {
      console.error("Failed to log canary event", e);
    }

    return res.status(404).send("Not Found");
  }

  next();
});

///////////////////////////
// PUBLIC
///////////////////////////

app.get("/health", (req, res) => {
  res.send("OK");
});

///////////////////////////
// EVENTS
///////////////////////////

app.get("/events", verifyToken, async (req, res) => {

  const { data, error } = await supabase
    .from("security_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch events" });
  }

  res.json({ events: data || [] });
});

///////////////////////////
// SIMULATE ATTACK
///////////////////////////

app.post("/simulate-attack", verifyToken, async (req, res) => {

  const ip = getIP(req);

  const created = [];

  created.push(
    await insertSecurityEvent({
      event_type: "unauthorized_access",
      endpoint: "/admin",
      ip_address: ip,
      details: "simulated"
    })
  );

  created.push(
    await insertSecurityEvent({
      event_type: "ddos_suspected",
      endpoint: "/api/search",
      ip_address: ip,
      details: "simulated"
    })
  );

  res.json({
    ok: true,
    created
  });
});

///////////////////////////

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});