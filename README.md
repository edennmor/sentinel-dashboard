# Sentinel – AI-Powered Cybersecurity Monitoring Platform

Sentinel is a full-stack cybersecurity monitoring platform I built with a strong focus on backend security logic and real-time traffic analysis.

The system processes incoming HTTP requests through multiple detection layers, identifies attack patterns such as DDoS, SQL injection, and brute-force attempts, and logs structured security events into a database. On top of this rule-based detection engine, I integrated an AI layer to classify requests and provide clear explanations for suspicious behavior, all visualized in a real-time dashboard.

I designed and built this system from scratch as a personal project to deepen my understanding of backend security and real-world attack detection.
---

## 🔗 Live Demo  
http://13.53.130.40:3000/
Password: admin123
---

## System Overview

The platform follows a layered detection approach:

1. Request interception layer – captures all incoming traffic  
2. Detection middleware layer – applies multiple security checks  
3. Event logging layer – stores structured security events  
4. AI analysis layer – classifies suspicious behavior  
5. Visualization layer – presents insights in the dashboard  

---

## Backend Security Logic

### Rate Limiting (DDoS Detection)
- Tracks request frequency per IP  
- Threshold-based detection (25 requests/minute)  
- Logs `ddos_suspected` events  

### Endpoint Scanning Detection
- Detects rapid access across multiple endpoints  
- Identifies reconnaissance behavior  
- Logs `scanner_detected` events  

### Brute Force Detection
- Tracks repeated failed login attempts  
- Time-window based logic  
- Logs `brute_force` and `failed_login` events  

### SQL Injection Detection
- Inspects URL + request body  
- Matches known injection patterns  
- Logs `sqli_suspected` events  

### Canary Endpoints (Trap Mechanism)
- Hidden endpoints like `/admin`, `/.env`  
- Any access is flagged as suspicious  
- Logs `unauthorized_access` events  

---

## AI-Based Threat Analysis

- Classifies requests as **"normal" or "suspicious"**  
- Provides short explanations  
- Adds an intelligent layer beyond static rules  

Example:

{
  "type": "suspicious",
  "reason": "Possible SQL injection pattern"
}

---

## Dashboard Features

- Real-time event monitoring and filtering  
- IP tracking and behavioral analysis  
- Attack simulation for testing detection logic  
- Visual insights into traffic patterns  

---

## Architecture

React (AWS S3 + CloudFront)  
→ Node.js / Express API (AWS EC2)  
→ Supabase (PostgreSQL)

---

## Tech Stack

- React  
- Node.js / Express  
- OpenAI API  
- Supabase  
- AWS (EC2, S3, CloudFront)  

---

## What This Project Demonstrates

- Designing backend security systems  
- Building detection logic for real attack patterns  
- Combining rule-based + AI-based analysis  
- Full-stack cloud deployment  
- System design and cybersecurity thinking  

---

## Future Improvements

- Threat severity scoring  
- Real-time alerting (Slack / Email)  
- IP reputation and enrichment  
- Geo-location of attackers  
- Advanced analytics  