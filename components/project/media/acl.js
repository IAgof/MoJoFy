// components/project/media/acl.js

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
      if (method === 'PUT') {
        put(req, res, next);
      } else {
        next();
      }
    });
  }
  return false;
};

function put(req, res, next) {
  const mediaId = req.params.mediaId;
  let action = 'update_any';
  Store.get(mediaId)
    .then(media => {
      if (!media) {
        action = 'add_own';
      }
      if (media && (media.created_by === getUserId(req))) {
        action = 'update_own';
      }
      Acl.acl.query(getUserRole(req), 'media', action, function(err, allow) {
        if (!allow) {
          logger.debug("User " + getUserId(req) + " not allowed to action " + action + " in GET /media/:mediaId");
          return Response.error(req, res, next, 404); // TODO(jliarte): 31/08/18 shall we throw an error?
        }
        return next();
      });
    });
}
