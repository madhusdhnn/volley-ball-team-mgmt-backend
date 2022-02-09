import bcrypt from "bcryptjs";
import { IllegalArgumentError } from "./errors";

const BCRYPT_PATTERN = new RegExp(/\$2([ayb])?\$(\d\d)\$[.\/0-9A-Za-z]{53}/);

class BcryptPasswordEncoder {
  encode(rawPassword) {
    return bcrypt.hashSync(rawPassword);
  }

  matches(rawPassword, encodedPassword) {
    if (!rawPassword) {
      throw new IllegalArgumentError("rawPassword can not be null");
    }

    if (!encodedPassword || encodedPassword.length === 0) {
      console.log("Empty encoded password");
      return false;
    }

    if (!BCRYPT_PATTERN.test(encodedPassword)) {
      console.log("Encoded password does not look like BCrypt");
      return false;
    }

    return bcrypt.compareSync(rawPassword, encodedPassword);
  }
}

export { BcryptPasswordEncoder };
