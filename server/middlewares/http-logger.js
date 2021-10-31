const morgan = require("morgan");

morgan.token("timer", function (req, res) {
  return new Date().toISOString().replace(/:/g, "");
});

morgan.token("headers", function (req, res) {
  return JSON.stringify(req.headers);
});

const formatGroup = [
  ":timer", //":date[clf]",
  ":method",
  ":status",
  ":url",
  ":response-time(ms)",
  ":headers",
];

if (process.env.MODE === "production") {
  formatGroup.push("HTTP/:http-version", ":remote-addr");
}
const responseFormat = formatGroup.join(" | ");

exports.successLogger = morgan(responseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: console.log },
});

exports.errorLogger = morgan(responseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: console.log },
});
