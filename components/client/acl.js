const logger = require('../../logger');

const Acl = require('../access/acl');
const Response = require('../../network/response');

exports.middleware = function (req, res, next) {
	if (typeof req.user === 'undefined' || !req.user) {
		// No session. This is only for logged and allowed users, so...
		Response.error(req, res, next, 401, 'Unauthenticated');
		return false;
	} else if (typeof req.user.role === 'undefined') {
		// No role in token. Unauthorized
		Response.error(req, res, next, 403, 'Unauthorized');
		return false;
	}

	const method = req.method.toUpperCase();
	let action = null;

	if (method === 'GET') {
		action = 'read';
	} else if (method === 'POST') {
		action = 'add'
	}

	// Check if role is allowed to do this or not :S
	Acl.acl.query(req.user.role, 'client', action, function (err, allow) {
		logger.debug('[ACL] > Client - '+ req.user.role + ' trying to ' + action + '. Result: ' + allow);
		if(allow) {
			next();
		} else {
			Response.error(req, res, next, 403, 'Unauthorized');
		}
	});
}