"use strict";
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '..');

const winston = require('winston');
require('winston-loggly-bulk');

const Config = require('./config');
// Logger

const tsFormat = () => (new Date()).toLocaleTimeString();
const logLevel = Config.logLevel;

function getLabel(callingModule) {
	const parts = callingModule.filename.split('/');
	return parts[parts.length - 2] + '/' + parts.pop();
}

function getCalleeStr() {
	let calleeStr;
	const stackInfo = getStackInfo(1);

	if (stackInfo) {
		// get file path relative to project root
		calleeStr = 'in ' + stackInfo.relativePath + ':' + stackInfo.line;
	}
	return calleeStr;
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo (stackIndex) {
	// get call stack, and analyze it
	// get all file, method, and line numbers
	const stacklist = (new Error()).stack.split('\n').slice(3);

	// stack trace format:
	// http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
	// do not remove the regex expresses to outside of this method (due to a BUG in node.js)
	const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
	const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

	const s = stacklist[stackIndex] || stacklist[0];
	const sp = stackReg.exec(s) || stackReg2.exec(s);

	if (sp && sp.length === 5) {
		return {
			method: sp[1],
			relativePath: path.relative(PROJECT_ROOT, sp[2]),
			line: sp[3],
			pos: sp[4],
			file: path.basename(sp[2]),
			stack: stacklist.join('\n')
		}
	}
}

function logger(callingModule) {
	const winstonLogger = new winston.Logger({
		level: logLevel,
		transports: [
			//
			// - Write to all logs with level `info` and below to `combined.log`
			// - Write all logs error (and below) to `error.log`.
			//
			new (winston.transports.Console)({
				timestamp: tsFormat,
				label: getCalleeStr() || getLabel(callingModule),
				colorize: true,
			}),
			new (winston.transports.File)({ filename: '/var/log/winston.log' }),
		]
	});
	if (Config.LOGGLY_TOKEN) {
		winstonLogger.add(winston.transports.Loggly, {
			token: Config.LOGGLY_TOKEN,
			subdomain: 'videona',
			tags: ['Winston-NodeJS'],
			json: true
		});
	}
	return winstonLogger;
}

logger.logLevel = logLevel;
console.log("instantiated winston with level ", logger.logLevel);

module.exports = logger;
