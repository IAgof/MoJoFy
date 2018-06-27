const logger = require('../../logger');
const config = require('../../config');
const Persistent = require('../../store/' + config.persistence_db);

const type = 'user';

Persistent.index(type, ['username', 'email'], logger.debug);

exports.get = get;
exports.list = list;
exports.upsert = upsert;

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

function upsert(data, callback) {
	const id = data.id || data._id || null;
	delete data.id;
	delete data._id;

	// Cache.get(type, id, function(data) {
	// 	if(!data) {
			Persistent.add(type, data, id, function(result, id) {
				callback(result, id);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}
