# 🚀 SysMon Run Guidelines

This guide provides step-by-step instructions for running SysMon in various environments.

## 🛠️ Prerequisites
- **Python 3.10+** (Local)
- **Node.js 18+** (Local)
- **Docker & Docker Compose** (Containerized)
- **Kubernetes Cluster** (e.g., KinD, Minikube) + `kubectl`

---

## 1. Local Development (Manual)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
daphne -b 0.0.0.0 -p 8000 sysmon.asgi:application
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Go to `http://localhost:3000`.

---

## 2. Docker Compose (Quickest)

Runs the full stack (Backend, Frontend, and PostgreSQL).

```bash
docker-compose up --build
```
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`

---

## 3. Kubernetes (Kustomize)

### A. Build and Load Images
```bash
docker build -t sysmon-backend:working ./backend
docker build -t sysmon-frontend:v6 ./frontend

# For KinD:
kind load docker-image sysmon-backend:working sysmon-frontend:v6
```

### B. Deploy to Cluster
```bash
kubectl apply -k k8s/
```

### C. Access the Application
```bash
# Port-forward the frontend service
kubectl port-forward svc/sysmon-frontend 8080:80 -n sysmon
```
Access at `http://localhost:8080`.

> [!NOTE]
> The default Kubernetes deployment uses **SQLite** for simplicity. To use PostgreSQL, uncomment `base/postgres.yaml` in `k8s/kustomization.yaml` and update the backend environment variables.

---

## 🔍 Troubleshooting
- **WebSocket issues:** Ensure the `REACT_APP_WS_URL` is correctly set if not using the default proxy.
- **Backend crash:** Check logs with `kubectl logs -l app=sysmon-backend -n sysmon`.
- **Database:** SQLite is stored in `/app/data/db.sqlite3` inside the container/pod.
