import type { Knex } from "knex";

type KnexConfig = { [key: string]: Knex.Config };

const config: KnexConfig = {
  [process.env.NODE_ENV || "development"]: {
    client: "pg",
    connection: {
      port: parseInt(process.env.DB_PORT || "5432"),
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "volley_team_mgmt_dev",
    },
    migrations: {
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};

export default config;
