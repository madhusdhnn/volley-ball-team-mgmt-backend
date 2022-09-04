# Volley Ball Team Management API

This project is built with NodeJS and the database is PostgreSQL.

## Developer Notes

This service runs in two ports - One for the APIs and the other for Authentication and Authorization. This way we mimic API server and Auth server.

* TypeScript is supported
* Babel is used for compilation. Typescript checks for types only. Refer `build` script in `package.json`

## Development Server

* Generate your own `.env` file, from `.env.example` appending the `NODE_ENV` as file name at the end. Eg: `.env.development`
* Run `setup-dev-db.sh` file to spin up a database and seed it
* Run `npm run dev` for dev server. It starts in ports `5001` (for API) and `5002` (for Auth). It has `nodemon` which will help reload automatically upon changing any source files

## Build

Run `npm run build` to generate non-development build and then run the application with `npm start` command.
