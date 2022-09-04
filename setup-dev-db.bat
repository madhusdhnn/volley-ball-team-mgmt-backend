@ECHO OFF

echo "Dropping database.."
dropdb --if-exists --force -U postgres -h localhost -p 5432 volley_team_mgmt_dev

echo "Creating database.."
createdb -U postgres -h localhost -p 5432 volley_team_mgmt_dev

echo "Running migrations and seeds.."
npm run knex:dev migrate:latest && npm run knex:dev seed:run

EXIT /b 0