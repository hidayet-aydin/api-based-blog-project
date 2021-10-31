exports.err404 = (req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
  });
};

exports.err500 = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
    data: error.data,
  });
};
