#!/bin/bash
set -e

echo "==> Setting up SysMon Backend"
cd "$(dirname "$0")/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> Created .env from .env.example — update DB credentials if needed"
fi

# Run migrations
echo "==> Running database migrations"
python manage.py makemigrations monitor
python manage.py migrate

echo "==> Backend ready. Starting Daphne (ASGI) server on port 8000..."
daphne -b 0.0.0.0 -p 8000 sysmon.asgi:application
