const logger = require('../../../logger')(module);

const getUser = require("../../access/acl").getUser;
const getUserId = require("../../access/acl").getUserId;
const getUserRole = require("../../access/acl").getUserRole;
const Acl = require('../../access/acl');
const Response = require('../../../network/response');

const Store = require('./store');

exports.middleware = function(req, res, next) {
	const method = req.method.toUpperCase();

	if (!getUser(req)) {
		// Check if user have a Token
		Response.error(req, res, next, 401, 'Unauthenticated'); // TODO(jliarte): 31/08/18 change to throw error?
		return false;
	} else {
		Acl.middleware(req, res, function() {
			if (method === 'GET') {
				get(req, res, next);
			} else {
				next();
			}
		});
	}
	return false;
};

function get(req, res, next) {
	const user = getUser(req);
	let action = 'list_any';
	if (req.query.created_by === getUserId(req)) {
		action = 'list_own';
	}
	Acl.acl.query(getUserRole(req), 'composition', action, function(err, allow) {
		if (!allow) {
			logger.debug("User " + getUserId(req) + " not allowed to action " + action + " in GET /composition, filtering.");
			req.query.created_by = getUserId(req);
		}
		return next();
	});
}