const Acl = require('./acl');
const FileUpload = require('../file');
const merge = require('util-merge');
const Model = require('./model');
const Pass = require('../access/password');
const logger = require('../../logger')(module);
const config = require('../../config');

const Store = require('./store');
const Video = require('../video');

// Exposed functions

exports.get = get;
exports.getUserId = getUserId;
exports.list = list;
exports.add = add;
exports.exist = exist;
exports.update = update;
exports.query = query;
exports.updateVideoCounter = updateVideoCounter;


// Internal functions

function get(id, requestingUser, includePass, callback) {
	logger.debug("user.get method " + id + " by  ", requestingUser);
	Store.get(id, function (data) {
		if (data) {
			data._id = id;
			if (!includePass) {
				delete data.password;
			}

			if (!requestingUser) {
				requestingUser = {};
			}

			// TODO(jliarte): 29/06/18 move acl logic to router?
			Acl.query(requestingUser, 'see_email', function (allowed) {
				if (!allowed) {
					delete data.email;
				}
				if (!data.videoCount) {
					setVideoCounter(id, function (data) {
						return callback(data, null);
					});
				} else {
					return callback(data, null);
				}
			});
		} else {
			callback(null, 'That user does not exist', 404);
		}
	});
}

function getUserId(authId, callback) {
	logger.debug("user.getUserId method " + authId);
	const params = {
		filters: [{
			field: 'authId',
			operator: '=',
			value: authId
		}],
		limit: 1
	};
	query(params, null, false, function (users) {
		if (!users || users.length === 0) {
			callback(null);
		} else {
			callback(users[0]);
		}
	});
}

function add(data, requestingUser, callback) {
	logger.debug("user.add method, data - ", data);
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

function exist(data, requestingUser, callback) {
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
	logger.debug("userExists querying with params ", params);

	query(params, requestingUser, false, function (found, error) {
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
	logger.debug("user.update by user ", requestingUser);
	logger.debug("user.update data", data);
	if (!data.id && !data._id) {
		callback(null, 'No user id provided', 400);
		return;
	}

	prepare(data, function (model) {
		model._id = data.id || data._id;

		FileUpload.moveUploadedFile(file, config.storage_folder.user + '/' + model._id).then(response => {
			if (response) {
				model.pic = response;
			}
			updateUser(model, callback);
		});
	});
}

function updateUser(model, callback) {
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

				if (user.pic) {
					FileUpload.removeFromCloudStorage(user.pic);
				}

				callback(merged, null, 200);
			} else {
				callback(null, 'Unable to update the user', 500);
			}
		});
	});
}

function list(requestingUser, callback) {
	logger.debug("user.list ${id} by user ", requestingUser);
	query({}, requestingUser, false, callback);
}

function query(params, requestingUser, includePass, callback) {
	if (!requestingUser) {
		requestingUser = {};
	}

	Store.list(params, function (result) {
		if (result) {
			// TODO(jliarte): 29/06/18 move acl logic to router?
			Acl.query(requestingUser, 'see_email', function (allowed) {
				for (let i = 0; i < result.length; i++) {
					// result[i]._id = id;
					if (!includePass) {
						delete result[i].password;
					}

					if (!allowed) {
						delete result[i].email;
					}
				}
				callback(result, null, 201);
			});
		} else {
			callback(null, 'Unable to list users', 500);
		}
	});
}

function updateVideoCounter(userId, callback) {
	logger.debug("User.updateVideoCounter of user " + userId);
	if (!userId) {
		typeof callback === 'function' && callback(null);
		return false;
	}

	Store.get(userId, function (data) {
		logger.debug("UserStore got user ", userId, data);
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

function prepare(data, next) {
	const model = Model.set(data);
	next(model);

	// TODO(jliarte): 27/06/18 clean auth code
	// updatePassword(model, next);
}

function updatePassword(data, next) {
	// Check if password shall be created
	if (typeof(data.password) !== 'undefined') {
		Pass.crypt(data.password, function (err, hash) {
			data.password = hash;
			next(data);
		});
	} else {
		next(data);
	}
}
