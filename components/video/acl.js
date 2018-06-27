const logger = require('../../logger');

const Acl = require('../access/acl');
const Response = require('../../network/response');

const Store = require('./store');

exports.middleware = function(req, res, next) {
	const method = req.method.toUpperCase();
	
	if (method === 'GET' && req.url.indexOf('/original') > -1) {
		download(req, res, next);
	} else if (!req.user) {
		// Check if user have a Token (and is not a download)
		Response.error(req, res, next, 401, 'Unauthenticated');
		return false;
	} else {	
		Acl.middleware(req, res, function() {
			if (method === 'DELETE') {
				remove(req, res, next);
			} else if (method === 'PUT') {
				put(req, res, next);
			} else {
				next();
			}
		});
	}
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

function download(req, res, next) {
	var id = req.params.id || req.params._id || null;
	var action = 'download_other';

	if(!req.user) {
		logger.info('User not logged tries to download video');
		req.user = {};
		req.query.code = req.query.code || null;
		next();

	} else {		

		Store.get(id, function(data) {		
			if(data && data.owner === req.user.sub) {
				action = 'download_own';
			}

			Acl.acl.query(req.user.role, 'video', action, function(err, allow) {
				if(allow) {
					logger.info('I am the owner of that video');
					req.owner = true;
				} else {
					logger.info('I have the code to download that video');
					req.query.code = req.query.code || null;
				}
				next();
			});
		});
	}
}