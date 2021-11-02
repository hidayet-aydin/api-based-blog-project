const { config, createLogger, format, transports } = require("winston");
const { combine, printf, timestamp, prettyPrint } = format;

exports.httpLogger = createLogger({
  level: "info",
  format: combine(
    printf(({ level, message }) => {
      let msg_parts = message.split(" | | ");
      return `{"${level}": {"combined": "${msg_parts[0]}", "headers": ${msg_parts[1]}}},`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./logs/http.json" }),
  ],
});

// logger.log("debug", error.message);
exports.logger = createLogger({
  level: "debug",
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./logs/debug.log" }),
  ],
});
