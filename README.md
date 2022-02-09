# Volley Ball Team Management API

This project is built with NodeJS and the database is PostgreSQL.

## Developer Notes

This service runs in two ports - One for the APIs and the other for Authentication and Authorization. This way we mimic API server and Auth server.

ES6 is setup with `Babel Node`.

## Development Server

- Run `setup-dev-db.sh` file to setup a database with some data to get started.
- Run `npm run dev` for dev server. It starts in ports `5001` (for API) and `5002` (for Auth). It has `nodemon` which will help reload automatically upon changing any source files

## Build

Run `npm run build` to generate non-development build and then run the application with `npm start` command.
