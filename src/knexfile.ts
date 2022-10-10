import type { Knex } from "knex";

type KnexConfig = { [key: string]: Knex.Config };

const config: KnexConfig = {
  [process.env.NODE_ENV as string]: {
    client: "pg",
    connection: {
      port: parseInt(process.env.DB_PORT as string),
      host: process.env.DB_HOST as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
  },
};

if (["development", "test"].includes(process.env.NODE_ENV as string)) {
  config[process.env.NODE_ENV as string] = {
    ...config[process.env.NODE_ENV as string],
    seeds: {
      directory: "../seeds",
    },
  };
}

export default config;
