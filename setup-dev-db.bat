@ECHO OFF

echo "Dropping database.."
  dropdb --if-exists --force -U postgres -h localhost -p 5432 volley_team_mgmt_dev

  echo "Creating database.."
  createdb -U postgres -h localhost -p 5432 volley_team_mgmt_dev

  echo "Running migrations.."
  psql -U postgres -h localhost -p 5432 -d volley_team_mgmt_dev -a -f ./dev-db.sql

EXIT /b 0