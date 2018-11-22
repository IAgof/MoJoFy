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
		Acl.middleware(req, res, function() { // TODO(jliarte): 20/09/18 this is causing general action (read, update, delete) tests, should we remove? as we are testing again later with specific actions (_own, _any)
			if (method === 'GET') {
				if (req.params.compositionId) {
					isEntityAccessAllowed('read', req, res, next);
				} else {
					list(req, res, next);
				}
			} else if (method === 'PUT') {
        isEntityAccessAllowed('update', req, res, next)
      } else if (method === 'DELETE') {
        isEntityAccessAllowed('delete', req, res, next)
      } else {
				next();
			}
		});
	}
	return false;
};

function getActionForEntity(entityId, userId, baseAction) {
  return Store.get(entityId)
    .then(composition => {
      if (composition && (composition.created_by !== userId)) {
	      return baseAction += '_any';
      } else {
	      return baseAction += '_own';
      }
    });
}

function isActionAllowedToRole(action, role) {
	return new Promise((resolve, reject) => {
    Acl.acl.query(role, 'composition', action, function (err, allow) {
      if (err) {
        return reject(err);
      }
      resolve (allow);
    });
	});
}

function isEntityAccessAllowed(baseAction, req, res, next) {
	const compositionId = req.params.compositionId;
	let action;
  return getActionForEntity(compositionId, getUserId(req), baseAction)
		.then(act => {
			action = act;
      return isActionAllowedToRole(action, getUserRole(req));
    })
		.then(allowed => {
      if (!allowed) {
        logger.debug("User " + getUserId(req) + " not allowed to " + action + " in " + req.url);
        return Response.error(req, res, next, 404); // TODO(jliarte): 31/08/18 shall we throw an error?
      }
      return next();
		});
}

function list(req, res, next) {
	let action = 'list_any';
	if (req.query.created_by === getUserId(req)) {
		action = 'list_own';
	}

  return isActionAllowedToRole(action, getUserRole(req))
	  .then(allowed => {
      if (!allowed) {
        logger.debug("User " + getUserId(req) + " not allowed to " + action + " in GET /composition, filtering.");
        req.query.created_by = getUserId(req);
      }
      return next();
	  });
}
