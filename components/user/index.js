// components/user/index.js

const FileUpload = require('../file');
const merge = require('util-merge');
const Model = require('./model');
const logger = require('../../logger')(module);
const config = require('../../config');

const StoreCB = require('./store');
const Video = require('../video');
const billingCtrl = require('../billing');
const emailNotificationsCtrl = require('../email_notifications');

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../util/promisifier-utils');
const Store = Bluebird.promisifyAll(StoreCB, { promisifier: PromisifierUtils.noErrPromisifier });

// Exposed functions

exports.get = get;
exports.getUserId = getUserId;
exports.getUserByEmail = getUserByEmail;
exports.list = list;
exports.add = add;
exports.exist = exist;
exports.userExists = userExists;
exports.update = update;
exports.query = query;
exports.updateVideoCounter = updateVideoCounter;
exports.decreaseVideoCounter = decreaseVideoCounter;
exports.setPrehistericUser = setPrehistericUser;

// Internal functions

function get(id, callback) {
	logger.info("userCtrl.get method " + id);
	Store.get(id, function (data) {
		if (data) {
			data._id = id;
			if (data.videoCount === undefined) {
				setVideoCounter(id, function (data) {
					return callback(data, null);
				});
			} else {
				return callback(data, null);
			}

		} else {
			callback(null, 'That user does not exist', 404);
		}
	});
}

function getUserId(authId, callback) {
	logger.info("userCtrl.getUserId method " + authId);
	const params = {
		filters: [{
			field: 'authId',
			operator: '=',
			value: authId
		}],
		limit: 1
	};
	query(params, function (users) {
		if (!users || users.length === 0) {
			callback(null);
		} else {
			callback(users[0]);
		}
	});
}

function setPrehistericUser(user, prehisteric) {
  logger.info("userCtrl.setPrehistericUser [" + prehisteric + "] to user [" + user._id + "]");
  if (prehisteric === true && !user.prehisteric) {
  	user.id = user._id;
  	user.prehisteric = prehisteric;
	  const userToUpsert = Object.assign({}, user);
  	return Store.upsertAsync(userToUpsert) // TODO(jliarte): 22/10/18 user may be changed in that upsert, so we need to make a copy to use it later :S
		  .then((res, id) => {
        // assign hero plan to user (for a year)
        billingCtrl.givePromotionProductToUserForAYear(user, 'hero', 'prehistericUser');
        // send prehisteric thanks welcome to hero email
			  emailNotificationsCtrl.sendPrehistericPromotionWelcomeEmail(user);
      });
  }
}

function getUserByEmail(email, callback) {
	logger.info("userCtrl.getUserByEmail method " + email);
	const params = {
		filters: [{
			field: 'email',
			operator: '=',
			value: email
		}],
		limit: 1
	};
	query(params, function (users) {
		if (!users || users.length === 0) {
			callback(null);
		} else {
			callback(users[0]);
		}
	});
}

function add(data, requestingUser, callback) {
	logger.info("userCtrl.add method, data - ", data);
	userExists(data, requestingUser, function (exists) {
		if (exists === null) {
			callback(null, 'Unable to register, no user or email provided', 400);
			return false;
		} else if (exists === true) {
			callback(null, 'User already exists', 400);
			return false;
		}

		if (!data.role || data.role === '') {
			data.role = 'guest';
		}

		// Execute all the code;
		prepare(data, function (model) {
			// TODO(jliarte): 27/06/18 check if this affects the rest of the tests xD :P
			model._id = data.id || data._id;

			Store.upsert(model, function (result, id) {
				if (result, id) {
					model._id = id;
					delete model.password;
					callback(model, null, 201);
				} else {
					callback(null, 'Unable to add the user', 500);
				}
			});
		});
	});
}

function exist(data, requestingUser, callback) { // TODO(jliarte): 22/10/18 there's no need for an intermediate function as http codes handling should go to router
	logger.debug("user.exists by ", requestingUser);
	userExists(data, requestingUser, function (exists) {
		if (exists === null) {
			callback(null, 'Unable to register, no user or email provided', 400);
			return false;
		}

		callback({exist: exists}, null, 200);
	});
}

function userExists(data, requestingUser, callback) {
	const params = {
		filters: [],
		limit: 1
	};

	if (typeof data.name === 'string' && data.name !== '') {
		params.filters.push({
			field: 'username',
			operator: '=',
			value: data.name
		});
	} else if (typeof data.email === 'string' && data.email !== '') {
		params.filters.push({
			field: 'email',
			operator: '=',
			value: data.email
		});
	} else {
		callback(null);
	}

	query(params, function (found, error) {
		if (error) {
			callback(null);
		}

		if (found && found.length > 0) {
			callback(true);
		} else {
			callback(false);
		}
	}, false);
}

function update(data, requestingUser, file, callback) {
	logger.info("userCtrl.update by user ", requestingUser);
	logger.debug("user.update data", data);
	if (!data.id && !data._id) {
		callback(null, 'No user id provided', 400);
		return;
	}

	prepare(data, function (model) {
		model._id = data.id || data._id;

		FileUpload.moveUploadedFile(file, config.storage_folder.user + '/' + model._id).then(newPicUrl => {
			logger.debug("user update res of move uploaded file is [" + newPicUrl + "]");
			if (newPicUrl) {
				model.pic = newPicUrl;
			}
			updateUser(model, callback);
		});
	});
}

function updateUser(model, callback) {
	logger.debug("user.userUpdate with model ", model);
	Store.get(model._id, function (user) {
		if (!user) {
			callback(null, 'Unable to update the user', 500);
			return false;
		}

		const merged = merge(user, model);

		Store.upsert(merged, function (result, id) {
			if (result, id) {
				merged._id = id;
				delete merged.password;

				// TODO(jliarte): 5/07/18 inspect this error from auth0-user middleware
				// if (user.pic) {
				// 	FileUpload.removeFromCloudStorage(user.pic);
				// }

				callback(merged, null, 200);
			} else {
				callback(null, 'Unable to update the user', 500);
			}
		});
	});
}

function list(requestingUser, callback) { // TODO(jliarte): 22/10/18 remove requestingUser
	logger.info("userCtrl.list by user ", requestingUser);
	query({}, callback);
}

function query(params, callback) {
	logger.info("userCtrl.query method");
	logger.debug("with params ", params);

	Store.list(params, function (result) {
		if (result) {
			callback(result, null, 201); // TODO(jliarte): 22/10/18 move http codes to router!
		} else {
			callback(null, 'Unable to list users', 500); // TODO(jliarte): 22/10/18 move http codes to router!
		}
	});
}

function updateVideoCounter(userId, callback) {
	logger.info("userCtrl.updateVideoCounter of user " + userId);
	if (!userId) {
		typeof callback === 'function' && callback(null);
		return false;
	}

	Store.get(userId, function (data) {
		if (data && data.videoCount) {
			data._id = userId;
			delete data.password;
			data.videoCount = Number(data.videoCount) + 1;
			update(data, null, null, function (updatedData, err) {
				if (err) {
					logger.error(err);
				}
				typeof callback === 'function' && callback(updatedData.videoCount || null);
			});
		} else if (data) {
			delete data.password;
			data._id = userId;
			setVideoCounter(data, callback);
		} else {
			logger.error('Error updating user video counter: That user does not exist');
			typeof callback === 'function' && callback(null);
		}
	}, true);
}

/**
 * Set user videoCount field
 *
 * @param data warning! data can be both a user entity or a user ID!!! :S
 * @param callback
 * @returns {boolean}
 */
function setVideoCounter(data, callback) {
	if (!data) {
		callback(null);
		return false;
	} else if (typeof data !== 'object') {
		// TODO(jliarte): 29/06/18 maybe separate in two calls/functions for a clearer code
		return updateVideoCounter(data, callback);
	}

	const userId = data.id || data._id;

	Video.count({
		filters: [{
			field: 'owner',
			operator: '=',
			value: userId
		}]
	}, function (userVideos) {
		data.videoCount = userVideos || 0;
		update(data, null, null, function (data, err) {
			if (err) {
				logger.error("Error counting videos:", err);
			} else {
				logger.log('Video counter setted for user ' + userId);
			}

			if (typeof callback === 'function') {
				callback(data);
			}
		});
	});
}

/**
 * Decrease user videoCount field
 *
 * @param userId user id
 * @param callback
 * @returns {boolean}
 */
function decreaseVideoCounter(userId, callback) {
	logger.info("userCtrl.decreaseVideoCounter of ", userId);
	Store.get(userId, function (data) {
		if (data) {
			if (data.videoCount) {
				data.id = userId;
				data.videoCount--;
				Store.upsert(data, callback);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
}

function prepare(data, next) {
	const model = Model.set(data);
	next(model);

	// TODO(jliarte): 27/06/18 clean auth code
	// updatePassword(model, next);
}
