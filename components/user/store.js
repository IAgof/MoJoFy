
const Persistent = require('../../store/datastore');
// const Cache = require('../../store/redis');

exports.get = get;
exports.list = list;
exports.upsert = upsert;


function get(id, callback) {

	// Cache.get('user', id, function(data) {
	// 	if(!data) {
			Persistent.get('user', id, function(data) {
				callback(data);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}

function list(params, callback) {

	// Cache.get('user', id, function(data) {
	// 	if(!data) {
			Persistent.query('user', params, function(data) {
				callback(data);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}

function upsert(data, callback) {
	const id = data.id || data._id || null;

	// Cache.get('user', id, function(data) {
	// 	if(!data) {
			Persistent.add('user', data, id, function(result, id) {
				callback(result, id);
			});
	// 	} else {
	// 		callback(data);
	// 	}
	// });
}
