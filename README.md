# Sentinel Security Dashboard

Sentinel is a lightweight security monitoring system designed to detect suspicious traffic patterns and visualize security events in real time.

The system analyzes incoming API requests and identifies potential security threats such as DDoS-like traffic spikes, endpoint scanning attempts, brute-force login attacks, and SQL injection patterns.

Detected events are stored in a database and displayed in a React dashboard for monitoring and analysis.

---

## Features

### Traffic Monitoring
The backend continuously analyzes incoming HTTP requests and detects abnormal activity.

Supported detections include:

- DDoS-like request flooding
- Endpoint scanning attempts
- Brute-force login attempts
- SQL injection patterns
- Unauthorized access to protected endpoints

---

## Detection Mechanisms

**Rate Limiting**

Limits requests per IP address.

25 requests per minute per IP

Exceeding the threshold triggers a `ddos_suspected` event.

---

**Endpoint Scanning Detection**

Tracks short-term request patterns and flags IPs making multiple rapid requests to different endpoints.

Triggers:

scanner_detected

---

**Brute Force Detection**

Monitors repeated login failures from the same IP within a short time window.

Triggers:

brute_force

---

**SQL Injection Detection**

Incoming requests are inspected for common SQL injection patterns such as:

' OR 1=1  
UNION SELECT  
DROP TABLE  
--

Triggers:

sqli_suspected

---

**Canary Endpoints**

Hidden endpoints are used to detect unauthorized probing attempts.

Examples:

/admin  
/internal  
/debug  
/.env

Access attempts trigger:

unauthorized_access

---

## Dashboard

A React dashboard provides an interface to view and analyze security events.

Capabilities include:

- Viewing detected security events
- Filtering events by attack type
- Inspecting endpoint and IP activity
- Simulating attacks for testing

---

## Architecture

React Dashboard (AWS S3 + CloudFront)  
↓  
Node.js / Express API (AWS EC2)  
↓  
Supabase Database (event storage)

---

## Tech Stack

**Backend**
- Node.js
- Express
- JWT authentication
- Security detection middleware
- Rate limiting

**Frontend**
- React
- Dashboard UI for event monitoring

**Infrastructure**
- AWS EC2 – backend API
- AWS S3 + CloudFront – frontend hosting
- Supabase – database for event logging

---

## Security Event Structure

Each event stored in the database includes:

- event_type
- endpoint
- ip_address
- details
- created_at

---

## Example Event Types

ddos_suspected  
scanner_detected  
brute_force  
sqli_suspected  
unauthorized_access  
failed_login

---

## Deployment

Frontend:

React build → AWS S3 → CloudFront

Backend:

Node.js API → AWS EC2

Database:

Supabase

---

## Future Improvements

Possible enhancements:

- Event severity scoring
- Event analytics and visualization
- IP reputation checks
- Alerting system (Slack / Email)
- Geo-location of attackers