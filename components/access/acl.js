const logger = require('../../logger')(module);
const Acl = require('virgen-acl').Acl;
const acl = new Acl();

const JWT = require('jsonwebtoken');

const Response = require('../../network/response');

const Config = require('../../config');

exports.acl = acl;
exports.middleware = middleware;
exports.token = token;
exports.getUser = getUser;
exports.getUserId = getUserId;
exports.getUserRole = getUserRole;

// TO_DO: 
// THIS SHALL BE RECOVERED FROM DATABASE.
const roles = {
	_roleList: ['admin', 'editor', 'marketing', 'operations', 'guest']
};
roles.video = {
		guest: ['read', 'add', 'list', 'update', 'delete', 'remove_own', 'update_own', 'download_own'],
		editor: ['read', 'add', 'list', 'update', 'delete', 'remove_own', 'remove_other', 'update_own', 'update_other', 'download_own', 'download_other',
			'update_privileged_fields']
	};
roles.user = {
		guest: ['read', 'add', 'edit_own', 'remove_own'],
		editor: ['read', 'add', 'list', 'update', 'edit_own', 'edit_other', 'remove_own', 'remove_other', 'see_email']
	};
roles.client = {
		guest: [],
		editor: ['read', 'add', 'update', 'delete']
	};
roles.distribute = {
		guest: [],
		editor: ['read', 'distribute']
	};

// TODO(jliarte): 31/08/18 define project actions for roles
roles.project = {};
roles.project.guest = ['read'];
roles.project.editor = roles.project.guest.concat();
roles.project.admin = roles.project.guest.concat();

roles.composition = {};
roles.composition.guest = ['read_own', 'add_own', 'list_own', 'update_own', 'delete_own'];
roles.composition.editor = roles.composition.guest.concat();
roles.composition.admin = roles.composition.guest.concat('read_any', 'list_any');

roles.media = {};
roles.media.guest = ['read_own', 'add_own', 'list_own', 'update', 'update_own', 'delete_own'];
roles.media.editor = roles.media.guest.concat();
roles.media.admin = roles.media.guest.concat('read_any', 'list_any');

roles.track = {};
roles.track.guest = ['read', 'read_own', 'add_own', 'list_own', 'update', 'update_own', 'delete', 'delete_own'];
roles.track.editor = roles.media.guest.concat();
roles.track.admin = roles.media.guest.concat('read_any', 'list_any');

roles.asset = {};
roles.asset.guest = ['read', 'read_own', 'add_own', 'list_own', 'update', 'update_own', 'delete', 'delete_own'];
roles.asset.editor = roles.media.guest.concat();
roles.asset.admin = roles.media.guest.concat('read_any', 'list_any');

roles.userFeature = {};
roles.userFeature.guest = ['read_own'];
roles.userFeature.editor = roles.userFeature.guest.concat();
roles.userFeature.admin = roles.userFeature.guest.concat();


// Allow "admin" to access all the resources
acl.allow('admin');

// If we've got roles...
if (roles._roleList) {
	// Add roles to the acl system
	for(let i = 0; i > roles._roleList.length; i++) {
		acl.addRole(roles._roleList.length[i]);
	}

	// Add resources to the acl system
	for(let resource in roles) {
		if(resource !== '_roleList') {
			acl.addResource(resource);
		}

		// And set the allowed actions for that resource
		for(let role in roles[resource]) {
			acl.allow(role, resource, roles[resource][role]);
		}
	}
} else {
	logger.warn('There are no role list in your role system. Only users with role admin are allowed to access the resources');
}


function middleware(req, res, next, operation) {
	if (!req.headers.authorization) {
		logger.error(' -- No authorization header present -- ');
		Response.error(req, res, next, 401);
		return false;
	}

	logger.debug("req user = token is ", req.user);

	const role = getUserRole(req) || 'guest';
	const resource = req.baseUrl.split('/')[1].toLowerCase();
	// const action = getAction(req, token);
	const action = operation || actionMethod(req);

	logger.debug('role: ' + role + '; resource: ' + resource + '; action: ' + action + ';');

	acl.query(role, resource, action, function(err, allow) {
		if (err) {
			Response.error(req, res, next, 500, 'There was an error performing access control');
		} else {
			if (allow) {
				next();
			} else {
				Response.error(req, res, next, 403);
			}
		}	
	});

	return false;
}

// function getAction(req, token) {
	
// 	var action = null;

// 	if(Object.getOwnPropertyNames(req.params).length > 0) {		
// 		// We've got params. Shall check in more detail.
		
// 		switch(req.baseUrl.split('/')[1].toLowerCase()) {

// 			case 'stat':
// 				action = Stats(req, token); 
// 				break;

// 			// case 'user':
// 			// 	action = Users(req, token); 
// 			// 	break;
// 		}
		
// 		// Once exited swithc
// 		if(!action) {
// 			action = actionMethod(req.method);
// 		}

// 	} else {
// 		action = actionMethod(req.method);
// 	}

// 	return action;
// }

// function actionMethod(method) {
function actionMethod(req) {

	var action = '';

	switch(req.method.toUpperCase()) {

		case 'GET':
			action = 'read';
			break;

		case 'POST':
			action = 'add';
			break;

		case 'PUT':
		case 'PATCH':
			action = 'update';
			break;

		case 'DELETE':
			action = 'delete';
			break;
	}

	return action;
}

function token(user) {
	return JWT.sign({
		iss: Config.jwt_issuer,
		sub: user._id,
		name: user.name,
		role: user.role || 'guest'
	}, Config.jwt_secret, { 
		expiresIn: Config.jwt_expires 
	});
}

function getUser(req) {
	let userProfile;
	if (req.user && req.user.userProfile) {
		userProfile = req.user.userProfile;
	}
	return userProfile;
}

function getUserId(req) {
	let id = -1;
	if (req.user && req.user.userProfile && req.user.userProfile._id) {
		id = req.user.userProfile._id;
	}
	return id.toString();
}

function getUserRole(req) {
	let role = '';
	if (req.user && req.user.userProfile && req.user.userProfile.role) {
		role = req.user.userProfile.role;
	}
	return role;
}
