@ECHO OFF

if [%1]==[] (
  echo Usage: ^.\setup-db.bat ^<DB_NAME^>
  exit /b 1
)

if not defined NODE_ENV (
  echo NODE_ENV is not set..
  exit /b 1
)

set DB_NAME_INPUT=%1

echo "Dropping database.."
dropdb --if-exists --force -U postgres -h localhost -p 5432 %DB_NAME_INPUT%

echo "Creating database.."
createdb -U postgres -h localhost -p 5432 %DB_NAME_INPUT%

echo "Running migrations and seeds.."
if "%NODE_ENV%"=="test" (
  yarn db:test
)
if "%NODE_ENV%"=="development" (
  yarn db:dev
)