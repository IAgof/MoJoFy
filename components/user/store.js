
const Persistent = require('../../store/datastore');
// const Cache = require('../../store/redis');

exports.get = get;
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

function upsert(data, callback) {

	const id = data.id || null;

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
