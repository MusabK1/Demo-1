const errorHandlerMiddleware = (err, req, res, next) => {
  const defaultError = {
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went worng, try again later.",
  };

  if (err.name === "ValidationError") {
    defaultError.statusCode = 400;
    defaultError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // unique
  if (err.code && err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.msg = `${Object.keys(err.keyValue)} field has to be unique.`;
  }

  console.log(`Error: ${defaultError.msg}`);
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};
export default errorHandlerMiddleware;
