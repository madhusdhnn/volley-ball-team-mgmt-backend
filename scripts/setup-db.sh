#!/usr/bin/env bash
set -e

if [[ -z "$1" ]];then
  echo "Usage: ./setup-db.sh <DB_NAME>"
  exit 1
fi

if [[ -z "${NODE_ENV}" ]];then
  echo "NODE_ENV is not set. So defaulting to Environment: development"
  export NODE_ENV=development
fi

db_name=$1

setup_db() {
  echo "Dropping database.."
  dropdb --if-exists --force -U postgres -h localhost -p 5432 $db_name

  echo "Creating database.."
  createdb -U postgres -h localhost -p 5432 $db_name

  echo "Running migrations and seeds.."
  case $NODE_ENV in
  "test")
  yarn db:test
  ;;
  "development")
  yarn db:dev
  ;;
  *)
  echo "Skipping.." 
  ;;
  esac
}

trap setup_db 0
trap setup_db ERR