#!/bin/bash
set -e

# Skip DB wait for SQLite
if [ "$DATABASE_ENGINE" = "django.db.backends.sqlite3" ]; then
  echo "==> Using SQLite - skipping DB wait"
else
  echo "==> Waiting for PostgreSQL..."
  until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(
        dbname=os.getenv('DB_NAME','sysmon_db'),
        user=os.getenv('DB_USER','sysmon_user'),
        password=os.getenv('DB_PASSWORD','sysmon_pass'),
        host=os.getenv('DB_HOST','db'),
        port=os.getenv('DB_PORT','5432'),
    )
    sys.exit(0)
except Exception:
    sys.exit(1)
"; do
    echo "   PostgreSQL not ready yet — retrying in 2s..."
    sleep 2
  done
  echo "==> PostgreSQL is ready!"
fi

echo "==> Running migrations..."
python manage.py makemigrations monitor --noinput
python manage.py migrate --noinput

echo "==> Starting Daphne on port 8000..."
exec daphne -b 0.0.0.0 -p 8000 sysmon.asgi:application