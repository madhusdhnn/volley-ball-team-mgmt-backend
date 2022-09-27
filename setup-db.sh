#!/usr/bin/env bash
set -e

if [[ -z "$1" ]];then
  printf "Usage: ./setup-db.sh <DB_NAME>"
  return 1

if [[ -z "${NODE_ENV}" ]];then
  printf "NODE_ENV is not set.."
  return 1

setup_db() {
  echo "Dropping database.."
  dropdb --if-exists --force -h localhost -p 5432 $1

  echo "Creating database.."
  createdb -h localhost -p 5432 $1

  echo "Running migrations and seeds.."
  case $NODE_ENV in
  "test")
  npm run test
  ;;
  "development")
  npm run dev
  ;;
  *)
  echo "Skipping.." 
  ;;
  esac
}

trap setup_db 0
trap setup_db ERR