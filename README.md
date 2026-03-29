# 🖥️ SysMon — System Resource Monitor

A full-stack real-time system monitor with a React frontend, Django + Django Channels backend, and PostgreSQL database.

---

## ✨ Features

| Feature | Details |
|---|---|
| **CPU** | Usage %, per-core breakdown, frequency, logical/physical counts |
| **RAM** | Used/available/swap, percent, live gauges |
| **Storage** | All disk partitions — total, used, free, filesystem type |
| **GPU** | Load %, VRAM, temperature (via GPUtil — NVIDIA only) |
| **Stack Usage** | Detects Python, Node.js, Java, Rust, Go, Browser, DB, System processes |
| **Processes** | Top 20 by CPU — filterable, sortable table |
| **Network** | Total sent/received per interface |
| **History Chart** | 2-min scrolling area chart for CPU / RAM / Disk |
| **WebSocket** | Live push every second via Django Channels |
| **PostgreSQL** | Periodic snapshots stored in DB with history API |

---

## 🗂️ Project Structure

```
sysmon/
├── backend/                  # Django project
│   ├── sysmon/               # Project settings, ASGI, URLs
│   ├── monitor/              # App: models, views, collector, consumers
│   ├── requirements.txt
│   ├── manage.py
│   ├── setup_db.sql          # PostgreSQL setup script
│   └── .env.example
│
├── frontend/                 # React app
│   ├── public/index.html
│   └── src/
│       ├── App.js            # Main layout with tabs
│       ├── index.css         # Dark industrial theme
│       ├── hooks/
│       │   └── useSystemMonitor.js  # WebSocket hook
│       └── components/
│           ├── Gauge.js
│           ├── CpuPanel.js
│           ├── RamPanel.js
│           ├── DiskPanel.js
│           ├── GpuPanel.js
│           ├── StackPanel.js
│           ├── ProcessTable.js
│           ├── NetworkPanel.js
│           └── HistoryChart.js
│
├── start_backend.sh
└── start_frontend.sh
```

---

## 🚀 Quick Start

### 1. PostgreSQL Database

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql && brew services start postgresql

# Run the setup script
psql -U postgres -f backend/setup_db.sql
```

### 2. Backend

```bash
# Run the setup + start script
chmod +x start_backend.sh
./start_backend.sh
```

Or manually:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Edit DB credentials if needed
python manage.py makemigrations monitor
python manage.py migrate
daphne -b 0.0.0.0 -p 8000 sysmon.asgi:application
```

> **Note:** Uses **Daphne** (ASGI) to support WebSocket connections.

### 3. Frontend

```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

Or manually:

```bash
cd frontend
npm install
npm start            # Opens http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/live/` | Live snapshot (not saved) |
| `GET` | `/api/snapshot/` | Collect + save to PostgreSQL |
| `GET` | `/api/history/?limit=60` | Last N snapshots from DB |
| `GET` | `/api/stacks/` | Stack usage aggregation |
| `GET` | `/api/processes/` | Top processes |
| `WS`  | `ws://localhost:8000/ws/monitor/` | Live WebSocket stream |

---

## ⚙️ Configuration

Edit `backend/.env`:

```env
SECRET_KEY=your-secret-key
DEBUG=True

DB_NAME=sysmon_db
DB_USER=sysmon_user
DB_PASSWORD=sysmon_pass
DB_HOST=localhost
DB_PORT=5432
```

Edit `frontend/src/hooks/useSystemMonitor.js` to change the WebSocket URL:
```js
const WS_URL = 'ws://localhost:8000/ws/monitor/';
```

---

## 🎮 GPU Support

GPU monitoring requires **NVIDIA GPU + drivers**:

```bash
# GPU support is included in requirements.txt (GPUtil)
# Verify your GPU is detected:
python -c "import GPUtil; print(GPUtil.getGPUs())"
```

For AMD/Intel integrated GPUs, the GPU panel shows a "No discrete GPU detected" message.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Recharts, WebSocket API |
| Backend | Python 3.10+, Django 4.2, Django REST Framework |
| Real-time | Django Channels 4, Daphne ASGI |
| Database | PostgreSQL 14+ via psycopg2 |
| Metrics | psutil, GPUtil |

---

## 📸 Tabs

- **Overview** — Dashboard with all resources at a glance
- **CPU** — Per-core usage + history chart
- **Memory** — RAM + swap details
- **Storage** — All disk partitions
- **Graphics** — GPU load, VRAM, temperature
- **Stacks** — Which tech stacks are consuming resources
- **Network** — Per-interface bandwidth
- **Processes** — Live sortable/filterable process list
