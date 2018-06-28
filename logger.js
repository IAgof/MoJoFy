const winston = require('winston');
const Config = require('./config');
// Logger

const tsFormat = () => (new Date()).toLocaleTimeString();
const logLevel = Config.logLevel;

const logger = new winston.Logger({
    level: logLevel,
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new (winston.transports.Console)({
          timestamp: tsFormat,
          // TODO(jliarte): 28/06/18 refactor logger https://stackoverflow.com/a/44983602
          // https://gist.github.com/ludwig/b47b5de4a4c53235825af3b4cef4869a
          // label: getLabel(callingModule),
	        colorize: true,
        }),
        // new (winston.transports.File)({ filename: 'winston.log' })
    ]
});
logger.logLevel = logLevel;
console.log("instantiated winston with level ", logger.logLevel);

module.exports = logger;
