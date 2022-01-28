#!/usr/bin/env bash
set -e

setup_db() {
  echo "Dropping database.."
  dropdb --if-exists --force volleyball_mgmt_dev -h localhost -p 5432

  echo "Creating database.."
  createdb volleyball_mgmt_dev -h localhost -p 5432

  echo "Running migrations.."
  psql -U postgres -h localhost -p 5432 -d volleyball_mgmt_dev -a -f ./dev-db.sql
}

trap setup_db 0
trap setup_db ERR
