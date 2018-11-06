// components/user/user-feature/acl.js

const logger = require('../../../logger')(module);

const getUser = require("../../access/acl").getUser;
const Response = require('../../../network/response');

exports.middleware = function(req, res, next) {
	if (!getUser(req)) {
		// Check if user have a Token
		Response.error(req, res, next, 401, 'Unauthenticated'); // TODO(jliarte): 31/08/18 change to throw error?
		return false;
	} else {
		next();
	}
	return false;
};