
const Acl = require('virgen-acl').Acl;
const acl = new Acl();

const JWT = require('jsonwebtoken');

const Response = require('../../network/response');

const Config = require('../../config');

exports.acl = acl;
exports.middleware = middleware;
exports.token = token;


// TO_DO: 
// THIS SHALL BE RECOVERED FROM DATABASE.
const roles = {
	_roleList: ['admin', 'marketing', 'operations', 'guest'],
	stat: {
		marketing: ['read', 'downloads', 'money'],
		operations: ['read', 'downloads', 'users']
	},
	user: {
		marketing: ['read', 'add', 'list'],
		operations: ['read', 'add', 'update']
	}
};


// Allow "admin" to access all the resources
acl.allow('admin');

// If we've got roles...
if(roles._roleList) {

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
	console.warn('There are no role list in your role system. Only users with role admin are allowed to access the resources');
}


function middleware(req, res, next, operation) {

	if(!req.headers.authorization) {
		Response.error(req, res, next, 401);
		return false;
	}

	const token = req.user;

	const role = token.role || 'guest';
	const resource = req.baseUrl.split('/')[1].toLowerCase();
	// const action = getAction(req, token);
	const action = operation || actionMethod(req, token);

	// console.log('role: ' + role + '; resource: ' + resource + '; action: ' + action + ';');

	acl.query(role, resource, action, function(err, allow) {

		if(err) {
			Response.error(req, res, next, 500, 'There was an error performing access control');
		} else {
			if(allow) {
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
