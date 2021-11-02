const morgan = require("morgan");

morgan.token("timer", function (req, res) {
  return new Date().toISOString();
});

// res.req.headers
// res.req.body
morgan.token("headers", function (req, res) {
  return JSON.stringify(req.headers);
});

const responseFormat = [
  ":timer", //":date[clf]",
  ":remote-addr",
  "HTTP/:http-version",
  ":method",
  ":status",
  ":url",
  ":response-time(ms)",
  "| :headers",
].join(" | ");

exports.successHttp = (logger) =>
  morgan(responseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.log("info", message) },
  });

exports.errorHttp = (logger) =>
  morgan(responseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.log("error", message) },
  });
