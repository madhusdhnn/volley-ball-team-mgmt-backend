echo "Dropping database.."
dropdb --if-exists --force volleyball_mgmt_dev -h localhost -p 5432

echo "Creating database.."
createdb volleyball_mgmt_dev -h localhost -p 5432

echo "Running migrations.."
psql -U postgres -h localhost -p 5432 -d volleyball_mgmt_dev -a -f ./dev-db-setup.sql
