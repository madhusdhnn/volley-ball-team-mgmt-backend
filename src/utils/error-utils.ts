class IllegalArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalArgumentError";
  }
}
class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateError";
  }
}

class AuthenticationError extends Error {
  public readonly errorCode: string;

  constructor(errorCode: string, message: string) {
    super(message);
    this.errorCode = errorCode;
    this.name = "AuthenticationError";
  }
}

class IncorrectResultSetDataAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncorrectResultSetDataAccessError";
  }
}

export { IllegalArgumentError, InvalidStateError, AuthenticationError, IncorrectResultSetDataAccessError };
