# Sentinel Security Dashboard

## Overview

Sentinel is an end-to-end security monitoring platform designed to detect suspicious activity in web applications. The system analyzes incoming HTTP requests, identifies attack patterns such as endpoint scanning, unauthorized access attempts, abnormal request rates, and behaviors indicating potential Distributed Denial of Service (DDoS) attacks.

The platform demonstrates how security monitoring mechanisms can be integrated directly into modern web architectures by combining traffic analysis, attack detection logic, security event logging, and a centralized monitoring interface.

The system is built as a full end-to-end platform including frontend, backend, database, and cloud infrastructure.

---

## Live Demo

http://13.53.130.40:3000

Access to the dashboard is protected by a login page.

Password  
admin123

---

## Core Capabilities

• Detection of suspicious request patterns  
• Endpoint scanning detection  
• Unauthorized access detection using Canary endpoints  
• Rate-limit abuse detection  
• Monitoring patterns indicating potential DDoS attacks  
• Attack simulation for testing detection mechanisms  
• Real-time security event monitoring

The system analyzes HTTP request behavior in order to identify automated or malicious activity.

For example, when a client sends requests to multiple endpoints within a short time frame, the system may identify this as an endpoint scanning attempt. In such cases, Sentinel records the event and displays it in the monitoring dashboard.

The platform also implements Canary endpoints such as `/admin`, `/debug`, `/internal`, and `/.env`. These endpoints function as security traps. Legitimate users should not attempt to access them directly, therefore any request made to these paths is considered suspicious and is logged as a potential unauthorized access attempt.

In addition, the system monitors request rates and detects abnormal traffic patterns. When a client sends an unusually high number of requests within a short time window, the system may classify this behavior as potential automated traffic or an early stage of a DDoS attack.

The platform also includes an attack simulation feature which allows the generation of simulated attack events in order to verify the detection mechanisms and demonstrate how the monitoring system responds to suspicious activity.

---

## System Architecture

The system is implemented as a full stack architecture consisting of several layers.

### Frontend

A React-based monitoring dashboard that displays detected security events in real time.  
The interface allows users to observe application activity and identify suspicious patterns.

### Backend

A Node.js and Express API responsible for:

- Analyzing incoming HTTP requests  
- Detecting attack patterns  
- Enforcing rate limiting  
- Generating security events  
- Handling authentication using JWT

### Database

Supabase is used as the persistent storage layer for security events.

Each detected event is stored with metadata such as:

- Event type  
- Source IP address  
- Accessed endpoint  
- Timestamp  
- Detection details

### Cloud Deployment

The platform is deployed in a cloud environment simulating a production-style architecture.

Backend Hosting  
AWS EC2

Frontend Static Hosting  
AWS S3

Process Management  
PM2 ensures backend process stability and automatic restarts.

---

## Technologies

React  
Node.js  
Express  
JWT Authentication  
Supabase  
AWS EC2  
AWS S3  
PM2

---

## Project Goal

The goal of this project is to demonstrate how security monitoring mechanisms can be integrated into modern web applications in order to detect, log, and visualize suspicious activity at the application level.

By combining traffic analysis, attack detection logic, event logging, and real-time visualization, the system illustrates how application-level monitoring can provide visibility into abnormal traffic patterns and potential security threats targeting web services.


