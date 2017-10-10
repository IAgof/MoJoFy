
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
		// const id = req.data.id || req.data._id || req.params.id;
		const owner = req.data && req.data.owner;
		const method = req.method.toUpperCase();
		const editMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

		if(editMethods.indexOf(method) > -1 && owner && req.user.sub !== owner) {
			Acl.acl.query(req.user.role, 'achievement', 'editOther', function(err, allow) {
				if(err) {
					console.error(err);
					Response.error(req, res, next, 403, 'Unauthorized');
					return false;
				}

				if(!allow) {
					Response.error(req, res, next, 403, 'Unauthorized');
					return false;
				}

				next();
				return false;
			});
		} else {
			next();
		}

	});

	return false;
};


exports.query = function(token, operation, callback) {

	Acl.acl.query(token.role, 'achievement', operation, function(err, allow) {
		callback(allow);
	});
	
	return false;
};