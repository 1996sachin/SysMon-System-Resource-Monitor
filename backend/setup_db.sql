-- Run this as postgres superuser to set up the database
-- psql -U postgres -f setup_db.sql

CREATE DATABASE sysmon_db;
CREATE USER sysmon_user WITH ENCRYPTED PASSWORD 'sysmon_pass';
GRANT ALL PRIVILEGES ON DATABASE sysmon_db TO sysmon_user;

-- Connect to the new DB and grant schema permissions
\c sysmon_db
GRANT ALL ON SCHEMA public TO sysmon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sysmon_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sysmon_user;
