
const Acl = require('../access/acl');
const Response = require('../../network/response');

const Store = require('./store');


exports.middleware = function(req, res, next) {
	
	// Check if user have a Token
	if(!req.user) {
		Response.error(req, res, next, 401, 'Unauthenticated');
		return false;
	}
	
	Acl.middleware(req, res, function() {
		if(req.method.toUpperCase() === 'DELETE') {
			remove(req, res, next);
		} else {
			next();
		}
	});

	return false;
};


exports.query = function(token, operation, callback) {

	Acl.acl.query(token.role, 'video', operation, function(err, allow) {
		callback(allow);
	});
	
	return false;
};


function remove(req, res, next) {
	
	var id = req.params.id || req.params._id || null;
	var action = '';

	Store.get(id, function(data) {		
		if(data && data.owner === req.user.sub) {
			action = 'remove_own';
			console.log('Shall allow, but lets try to force error...');
		} else {
			action = 'remove_other';
		}

		Acl.acl.query(req.user.role, 'video', action, function(err, allow) {
			if(allow) {
				next();
			} else {
				Response.error(req, res, next, 403, 'Unauthorized');
			}
		});
	});
}
