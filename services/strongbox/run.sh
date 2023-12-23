#!/bin/sh
chown -R cryptokek:2000 ./data
su cryptokek -c "touch data/sqlite.db"
su cryptokek -c "sqlite3 data/sqlite.db < init.sql"
su cryptokek -c "PYTHONUNBUFFERED=1 python3 /service/main.py"