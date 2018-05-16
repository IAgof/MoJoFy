// const Acl = require('./acl');
const FileUpload = require('../file');
const Model = require('./model');
const Pass = require('../access/password');
const Store = require('./store');
const logger = require('../../logger');
const config = require('../../config');

const Video = require('../video');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.exist = exist;
exports.update = update;
exports.query = query;
exports.updateVideoCounter = updateVideoCounter;


// Internal functions

function get(id, token, callback, includePass) {

	Store.get(id, function(data) {
		if(data) {
			data._id = id;
			if(!includePass) {
				delete data.password;
			}

			if(!data.videoCount) {
				setVideoCounter(id, function(data) {
					callback(data, null);
				})
			} else {
				callback(data, null);
			}

		} else {
			callback(null, 'That user does not exist', 404);
		}
	});
}

function add(data, token, callback) {
	logger.debug("user.add mehod, data - ", data);
	isUser(data, token, function (exists) {
		if (exists === null) {
			callback(null, 'Unable to register, no user or email provided', 400);
			return false;
		} else if (exists === true) {
			callback(null, 'User already exists', 400);
			return false;
		}
		
		// Execute all the code;
		prepare(data, function(model) {
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

function exist(data, token, callback) {
	isUser(data, token, function (exists) {
		if (exists === null) {
			callback(null, 'Unable to register, no user or email provided', 400);
			return false;
		}

		callback({exist: exists}, null, 200);
	});
}

function isUser(data, token, callback) {
	var params = {
		filters: [],
		limit: 1
	};

	if(typeof data.name === 'string' && data.name !== '') {
		params.filters.push({
			field: 'name', 
			operator: '=', 
			value: data.name
		});
	} else if(typeof data.email === 'string' && data.email !== '') {
		params.filters.push({
			field: 'email', 
			operator: '=', 
			value: data.email
		});
	} else {
		callback(null);
	}
	logger.debug("querying with params ", params);

	query(params, token, function(found, error) {	//, code) {
		if(error) {
			callback(null);
		}

		if(found && found.length > 0) {
			callback(true);
		} else {
			callback(false);
		}
	}, false);
}

function update(data, token, file, callback) {
	if(!data.id && !data._id) {
		callback(null, 'No user id provided', 400);
		return;
	}
	
	prepare(data, function(model) {

		model._id = data.id || data._id;
		
		FileUpload.moveUploadedFile(file, config.storage_folder.user + '/' + model._id).then(response => {
			if (response) {
				model.pic = response;
			}
			Store.upsert(model, function(result, id) {
				if(result, id) {
					model._id = id;
					delete model.password;
					callback(model, null, 201);
				} else {
					callback(null, 'Unable to update the user', 500);
				}
			});
		});

	});
}

function list(token, callback) {
	query({}, token, callback);
}

function query(params, token, callback, includePass) {
	// Acl.query(token, 'list', function(success) {

		Store.list(params, function(result) {
			if(result) {
				for (var i = 0; i < result.length; i++) {
					// result[i]._id = id;
					if(!includePass) {
						delete result[i].password;
					}
				}
				callback(result, null, 201);
			} else {
				callback(null, 'Unable to list users', 500);
			}
		});
	// });
}

function updateVideoCounter(userId, callback) {
	if(!userId) {
		return false;
	}

	Store.get(userId, function(data) {
		if (data && data.videoCount) {
			data._id = userId;
			delete data.password;
			data.videoCount = Number(data.videoCount) + 1;
			update(data, null, null, function (updatedData, err) {
				if (err) {
					logger.error(err);
				}
			});
		} else if (data) {
			delete data.password;
			data._id = userId;
			setVideoCounter(data, callback);
		} else {
			logger.error('Error updating user video counter: That user does not exist');
		}
	}, true);
}

function setVideoCounter(data, callback) {
	if(!data) {
		callback(null);
		return false;
	} else if(typeof data !== 'object') {
		return updateVideoCounter(data, callback);
	}

	const userId = data.id || data._id;

	Video.count({
		filters: [{
			field: 'owner',
			operator: '=',
			value: userId
		}]
	}, function(userVideos) {
		data.videoCount = userVideos || 0;
		update(data, null, null, function (data, err) {
			if (err) {
				logger.error(err);
			} else {
				logger.log('Video counter setted for user ' + userId);
			}

			if(typeof callback === 'function') {
				callback(data);
			}
		});
	});
}

function prepare(data, next) {
	const model = Model.set(data);

	// Check if pasword shall be created
	if(typeof(data.password) !== 'undefined') {
		Pass.crypt(data.password, function(err, hash) {
			model.password = hash;
			next(model);
		});
	} else {
		next(model);
	}
}
