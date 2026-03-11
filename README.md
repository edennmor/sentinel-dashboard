# Sentinel Security Dashboard

A full-stack security monitoring dashboard that detects and logs suspicious activity such as scanning attempts, unauthorized access, and potential DDoS behavior.

The system simulates real-world security monitoring and displays detected events in a live dashboard.

---

## Live Demo

http://13.53.130.40:3000

---

## Features

- Admin login with JWT authentication
- Security event logging
- Detection of suspicious behavior:
  - Rate limit abuse (DDoS-like behavior)
  - Endpoint scanning
  - Unauthorized access attempts (Canary endpoints)
- Security events dashboard
- Attack simulation button for testing detections
- Real-time security monitoring interface

---

## Tech Stack

Frontend
- React
- JavaScript
- Fetch API

Backend
- Node.js
- Express
- JWT Authentication
- Rate Limiting
- Helmet security middleware
- Morgan logging

Database
- Supabase (PostgreSQL)

Infrastructure
- AWS EC2 deployment
- PM2 process manager
- Linux server environment

---

## Security Mechanisms Implemented

Rate Limiting  
Detects excessive requests and logs them as potential DDoS activity.

Canary Endpoints  
Hidden endpoints such as `/admin`, `/internal`, `/debug`, and `/.env` trigger alerts when accessed.

Endpoint Scanning Detection  
Tracks rapid requests across multiple endpoints from the same IP.

JWT Authentication  
Admin access to the dashboard requires valid authentication tokens.

---

## Project Architecture

```
Frontend (React)
       │
       ▼
Backend API (Node.js / Express)
       │
       ▼
Security Event Logging
       │
       ▼
Supabase Database
```

---

## Running Locally

Backend

```
cd backend
npm install
npm start
```

Frontend

```
cd frontend
npm install
npm start
```

---

## Deployment

The application is deployed on AWS EC2 and managed using PM2 to keep the server running continuously.

---

## Author

Eden Mor  

