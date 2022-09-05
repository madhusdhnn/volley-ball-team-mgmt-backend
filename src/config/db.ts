import { knex } from "knex";
import knexConfig from "../knexfile";

const db = knex(knexConfig[process.env.NODE_ENV || "development"]);
export default db;
