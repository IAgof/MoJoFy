const logger = require('../../logger')(module);
const Acl = require('../access/acl');
const Response = require('../../network/response');

exports.middleware = function(req, res, next) {
	// Check if user have a Token
	if(!req.user) {
		Response.error(req, res, next, 401, 'Unauthenticated');
		return false;
	}

	Acl.middleware(req, res, function() {
		// Do more complex stuff here.
		next();
	});
	return false;
};

exports.query = function(user, operation, callback) {
	let role = 'guest';
	if (user && user.role) {
		role = user.role;
	}

	Acl.acl.query(role, 'user', operation, function(err, allow) {
		callback(allow);
	});
	
	return false;
};
