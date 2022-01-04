import {Pool} from "pg";

const volleyBallDb = new Pool({
  user: "postgres",
  password: "",
  host: "localhost",
  database: "volleyball_mgmt_dev",
  port: 5432
});

export default volleyBallDb;
