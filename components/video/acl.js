const logger = require('../../logger');

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
		} else if (req.method.toUpperCase() === 'PUT') {
			put(req, res, next);
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

function put(req, res, next) {
	var id = req.params.id || req.params._id || null;
	var action = '';

	Store.get(id, function(video) {
		if (!video) {
			// TODO(jliarte): improve this error handling!
			return Response.error(req, res, next, 404, 'Video id not found');
		}
		if (video && video.owner === req.user.sub) {
			action = 'update_own';
		} else {
			action = 'update_other';
		}
		logger.debug("video ACL action is ", action);

		Acl.acl.query(req.user.role, 'video', action, function (err, allow) {
			if (allow) {
				removePrivilegedFilds(req, res, next);
			} else {
				Response.error(req, res, next, 403, 'Unauthorized');
			}
		});
	});

}

function removePrivilegedFilds(req, res, next) {
	Acl.acl.query(req.user.role, 'video', 'update_privileged_fields', function (err, allow) {
		if (!allow) {
			delete req.body.featured;
			delete req.body.verified;
			delete req.body.credibility;
			delete req.body.quality;
			delete req.body.priceStd;
			delete req.body.priceCountry;
			delete req.body.priceContinent;
			delete req.body.priceWorld;
		}
		next();
	});
}

function remove(req, res, next) {
	var id = req.params.id || req.params._id || null;
	var action = '';

	Store.get(id, function(data) {		
		if(data && data.owner === req.user.sub) {
			action = 'remove_own';
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
