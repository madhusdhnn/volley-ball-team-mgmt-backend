# Volley Ball Team Management API

This project is built with NodeJS, Express and the database is PostgreSQL.

## Developer Notes

This service will run in two ports - One for the APIs and the other for Authentication & Authorization. This way we mimic API server and Auth server inside a single project.

- TypeScript is supported
- Babel is used for compilation. Typescript checks for types only. Refer `build` script in `package.json`
- KnexJS is used for Database migration, seeding and querying

## Setup Dev environment

- KnexJS:
  - Use `knex:dev` npm script to run Knex based commands. Eg: `npm run knex:dev migrate:[make:up|down|latest|rollback|status]`
  - Make sure to add `-x ts` flag at the end of any command that generates TS file; for eg: `migrate`
- Environment variables:
  - Generate your own `.env` file from `.env.example` adding `NODE_ENV` as suffix to the file name. Eg: `.env.development`
  - For Non-development environments like Production, the env vars are taken care in the deployment server level
- Database setup:
  - Run `setup-dev-db.sh` or `setup-dev-db.bat` (for Windows) file to spin up a new database, apply migrations on it and seed it with sample data
- Run `npm run dev` command to start the application in development mode
- It will run in two ports - `5001` (for API) and `5002` (for Auth). The script uses `nodemon` which will reload automatically upon changing any source files

## Build

- Run `npm run build` command to generate non-development build
- Run `npm start` command to start the server
