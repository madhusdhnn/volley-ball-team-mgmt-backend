import type { Knex } from "knex";

type KnexConfig = { [key: string]: Knex.Config };

const config: KnexConfig = {
  production: {
    client: "pg",
    connection: {
      port: 5432,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
  },
  development: {
    client: "pg",
    connection: {
      port: 5432,
      host: "localhost",
      user: "postgres",
      password: "",
      database: "volley_db_dev",
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },
  test: {
    client: "pg",
    connection: {
      port: 5432,
      host: "localhost",
      user: "postgres",
      password: "",
      database: "volley_db_test",
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "../seeds",
    },
  },
};

export default config;
