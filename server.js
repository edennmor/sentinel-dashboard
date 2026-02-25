import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

const PORT = process.env.PORT || 4000;
const JWT_SECRET = "supersecret"; // אפשר לשים ב-.env

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
// 🔐 AUTH LOGIN
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
// 🔐 AUTH MIDDLEWARE
///////////////////////////

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const token = header.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

///////////////////////////
// Canary middleware
///////////////////////////

const CANARY_ENDPOINTS = new Set(["/admin", "/internal", "/debug", "/.env"]);

app.use(async (req, res, next) => {
  if (CANARY_ENDPOINTS.has(req.path)) {
    const ip = req.socket.remoteAddress || "unknown";

    await insertSecurityEvent({
      event_type: "unauthorized_access",
      endpoint: req.path,
      ip_address: ip,
      details: "canary triggered",
    });

    return res.status(404).send("Not Found");
  }
  next();
});

///////////////////////////
// PUBLIC
///////////////////////////

app.get("/health", (req, res) => res.send("OK"));

///////////////////////////
// 🔐 PROTECTED ROUTES
///////////////////////////

app.get("/events", verifyToken, async (req, res) => {
  const { data } = await supabase
    .from("security_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  res.json({ events: data });
});

app.post("/simulate-attack", verifyToken, async (req, res) => {
  const ip = req.socket.remoteAddress || "unknown";

  const created = [];

  created.push(await insertSecurityEvent({
    event_type: "unauthorized_access",
    endpoint: "/admin",
    ip_address: ip,
    details: "simulated"
  }));

  created.push(await insertSecurityEvent({
    event_type: "ddos_suspected",
    endpoint: "/api/search",
    ip_address: ip,
    details: "simulated"
  }));

  res.json({ ok: true, created });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});