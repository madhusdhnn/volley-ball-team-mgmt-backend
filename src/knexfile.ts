import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { Knex } from "knex";
import { PgConnectionSecretValue } from "./utils/types";

type KnexConfig = { [key: string]: Knex.Config };

const defaultConfig = {
  port: 5432,
  host: "localhost",
  user: "postgres",
  password: "",
  database: "volley_db_default",
};

let pgConnectionSecretValue: PgConnectionSecretValue;

const config: KnexConfig = {
  [process.env.NODE_ENV as string]: {
    client: "pg",
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
    connection: async () => {
      if (!pgConnectionSecretValue) {
        const secretResult = await new SecretsManagerClient({ region: process.env.AWS_REGION as string }).send(
          new GetSecretValueCommand({ SecretId: process.env.DB_ACCESS_USER_SECRET_NAME as string }),
        );

        if (!secretResult.SecretString) {
          return defaultConfig;
        }

        pgConnectionSecretValue = JSON.parse(secretResult.SecretString) as PgConnectionSecretValue;
      }

      return {
        port: parseInt(pgConnectionSecretValue.port),
        host: pgConnectionSecretValue.host,
        user: pgConnectionSecretValue.username,
        password: pgConnectionSecretValue.password,
        database: pgConnectionSecretValue.dbname,
      };
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
