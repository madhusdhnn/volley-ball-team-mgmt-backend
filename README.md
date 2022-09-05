# Volley Ball Team Management API

This project is built with NodeJS, Express and the database is PostgreSQL.

## Developer Notes

This service will run in two ports - One for the APIs and the other for Authentication & Authorization. This way we mimic API server and Auth server inside a single project.

- TypeScript is supported
- ESLint and Prettier is configured with recommended rules for clean code and formatted source files
- ESLint extends Prettier configurations. So ESLint itself will take care of everything that Prettier does
- Babel is used for compilation. Typescript checks for types only. Refer `build` script in `package.json`
- KnexJS is used for Database migration, seeding and querying

## Setup Dev environment

Follow the below steps to setup the Development environment.

1. Environment variables:
    - Generate your own `.env` file from `.env.example` adding `NODE_ENV` as suffix to the file name. Eg: `.env.development`
    - For Non-development environments like Production, the env vars are taken care in the deployment server level
2. Knex JS:
    - Use `knex:dev` npm script to run Knex based commands. Eg: `yarn knex:dev migrate:[make:up|down|latest|rollback|status]`
    - Or use separate `knex:seed` and `knex:migrate` commands
    - Make sure to add `-x ts` flag at the end of any command that generates TS file; for eg: `migrate`
3. Database setup:
    - Run `setup-dev-db.sh` or `setup-dev-db.bat` (for Windows) file to spin up a new database, apply migrations on it and seed it with sample data
4. Linting & Formatting: (Optional)
    - Use `lint` and `format` npm commands to fix errors and format the code
    - If you use VSCode, you may enable `Format on Save` option in Settings to automatically format the code with our Prettier configuration
5. Application:  
    - Run `yarn dev` command to start the application in development mode
    - It will run in two ports - `5001` (for API) and `5002` (for Auth). The script uses `nodemon` which will reload automatically upon changing any source files

## Build

- Run `yarn build` command to generate non-development build
- Run `yarn start` command to start the server
