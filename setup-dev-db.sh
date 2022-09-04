#!/usr/bin/env bash
set -e

setup_db() {
  echo "Dropping database.."
  dropdb --if-exists --force -h localhost -p 5432 volley_team_mgmt_dev

  echo "Creating database.."
  createdb -h localhost -p 5432 volley_team_mgmt_dev

  echo "Running migrations.."
  psql -U postgres -h localhost -p 5432 -d volley_team_mgmt_dev -a -f ./dev-db.sql
}

trap setup_db 0
trap setup_db ERR
