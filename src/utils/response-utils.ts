export const unknownError = Object.freeze({
  status: "failed",
  code: "ERR_500",
  message: "Something went wrong!",
  detail: "Internal error. Contact your owner",
});

const toError = (e: Error, errCode?: string, message?: string) => {
  if (e) {
    return {
      status: "failed",
      code: errCode || unknownError.code,
      message: message || unknownError.message,
      moreDetails: JSON.stringify({ ...e, message: e.message }),
    };
  }

  return unknownError;
};

export { toError };
