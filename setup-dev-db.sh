#!/usr/bin/env bash
set -e

setup_db() {
  echo "Dropping database.."
  dropdb --if-exists --force -h localhost -p 5432 volley_team_mgmt_dev

  echo "Creating database.."
  createdb -h localhost -p 5432 volley_team_mgmt_dev

  echo "Running migrations and seeds.."
  npm run knex:dev migrate:latest && npm run knex:dev seed:run
}

trap setup_db 0
trap setup_db ERR
