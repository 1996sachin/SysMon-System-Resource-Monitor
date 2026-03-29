# 📄 Project Case Study: SysMon

## 🏥 Overview
**SysMon** is a comprehensive, real-time system resource monitoring solution. It provides a centralized dashboard for tracking critical metrics such as CPU usage, RAM utilization, storage health, GPU performance, and live process activity.

![Live SysMon Dashboard](/home/blink/.gemini/antigravity/brain/8250a055-53a7-478c-bdf3-313d91105e1e/sysmon_dashboard_full_1774801262455.png)

## 🎯 Objectives
- Provide a high-precision, low-latency monitoring interface.
- Enable historical data analysis through periodic snapshots.
- Demonstrate a modern production-ready deployment workflow using Docker and Kubernetes.

## 🧱 Technical Architecture
The system is built on a distributed architecture to ensure scalability and reliability:

### 1. Frontend Layer (React 18)
- **Real-time Updates:** Uses the browser’s WebSocket API to receive live metrics.
- **Data Visualization:** Employs `Recharts` for temporal data and custom SVG gauges for instantaneous values.
- **State Management:** Uses React hooks for efficient data flow and history buffering.

### 2. Backend Layer (Django & Daphne)
- **Data Collection:** Uses `psutil` and `GPUtil` to probe host-level metrics.
- **Concurrency:** Leverages Daphne (ASGI server) and Django Channels to manage multiple persistent WebSocket connections.
- **REST API:** Provides endpoints for historical snapshots and aggregation.

### 3. Database Layer (PostgreSQL)
- Stores persistent snapshots for long-term history and trend analysis.

### 4. Infrastructure & DevOps
- **Containerization:** Multistage Docker builds for optimized image sizes.
- **Orchestration:** Kubernetes (deployed via KinD) using Kustomize for multi-environment configuration management.
- **Proxying:** Nginx acts as a combined static file server and WebSocket proxy.

## 🚀 Deployment Highlights
- **SQLite vs Postgres:** Flexible configuration supporting both lightweight SQLite and production-grade PostgreSQL.
- **Automated Rollouts:** Kubernetes-native rollout strategies for zero-downtime updates.
- **Resource Management:** Precise CPU/Memory limits and request definitions for cluster stability.

## 🏆 Key Achievements
- Successfully implemented a high-frequency (1Hz) live data stream with minimal overhead.
- Ported a legacy local environment to a modern Kubernetes-first architecture.
- Built a highly reusable UI component library for data-dense dashboards.

---
© 2026 SysMon Team
