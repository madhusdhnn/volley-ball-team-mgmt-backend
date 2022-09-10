import bcrypt from "bcryptjs";
import crypto from "crypto";
import logger from "../logger";
import { IllegalArgumentError } from "./error-utils";

const BCRYPT_PATTERN = new RegExp(/\$2([ayb])?\$(\d\d)\$[./0-9A-Za-z]{53}/);

class BcryptPasswordEncoder {
  encode(rawPassword: string) {
    return bcrypt.hashSync(rawPassword);
  }

  matches(rawPassword: string, encodedPassword: string) {
    if (!rawPassword) {
      throw new IllegalArgumentError("rawPassword can not be null");
    }

    if (!encodedPassword || encodedPassword.length === 0) {
      logger.warn("Empty encoded password");
      return false;
    }

    if (!BCRYPT_PATTERN.test(encodedPassword)) {
      logger.warn("Encoded password does not look like BCrypt");
      return false;
    }

    return bcrypt.compareSync(rawPassword, encodedPassword);
  }
}

const generateSecureRandomKey = (hash = false) => {
  const randomString = crypto.randomBytes(32).toString("hex");
  if (!hash) {
    return randomString;
  }
  return crypto.createHash("sha256").update(randomString).digest("hex");
};

export { BcryptPasswordEncoder, generateSecureRandomKey };
