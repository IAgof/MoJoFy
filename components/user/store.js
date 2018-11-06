const logger = require('../../logger')(module);
const config = require('../../config');
const Persistent = require('../../store/' + config.persistence_db);

const type = 'user';

Persistent.index(type, ['username', 'email', 'authId'], logger.debug);

exports.get = get;
exports.list = list;
exports.upsert = upsert;
exports.removeId = removeId;

function get(id, callback) {
	// Cache.get(type, id, function(data) {
	// 	if(!data) {
			Persistent.get(type, id, function(data) {
				callback(data);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}

function list(params, callback) {
	// Cache.get(type, id, function(data) {
	// 	if(!data) {
			Persistent.query(type, params, function(data) {
				callback(data);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}

function upsert(user, callback) {
	const id = user.id || user._id || null;
	const userData = Object.assign({}, user);
	delete userData.id;
	delete userData._id;

	// Cache.get(type, id, function(user) {
	// 	if(!userData) {
			Persistent.add(type, userData, id, function(result, id) {
				typeof callback === 'function' && callback(result, id);
			});
	// 	} else {
	// 		callback(userData);
	// 	}
	// });
}

function removeId(id, callback) {
	Persistent.remove(type, id, function(data) {
		callback(data);
	});
}
