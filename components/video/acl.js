
const Acl = require('../access/acl');
const Response = require('../../network/response');
const logger = require('../../logger');

const Store = require('./store');


exports.middleware = function(req, res, next) {
	
	// Check if user have a Token
	if(!req.user) {
		Response.error(req, res, next, 401, 'Unauthenticated');
		return false;
	}
	
	Acl.middleware(req, res, function() {
		const method = req.method.toUpperCase();
		if(method === 'DELETE') {
			remove(req, res, next);
		} else if (method === 'GET' && req.url.indexOf('/original') > -1) {
			download(req, res, next);
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

function download(req, res, next) {
	var id = req.params.id || req.params._id || null;
	var action = 'download_other';

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
