
const Persistent = require('../../store/datastore');
// const Cache = require('../../store/redis');

const type = 'video';

exports.get = get;
exports.list = list;
exports.upsert = upsert;
exports.remove = remove;


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

	Persistent.add(type, data, id, function(result, id) {
		callback(result, id);
	});

}

function remove(id, callback) {
	Persistent.remove(type, id, function(data) {
		callback(data);
	});
}
