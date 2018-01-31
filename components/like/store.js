
const Persistent = require('../../store/datastore');
// const Cache = require('../../store/redis');

const type = 'like';

exports.upsert = upsert;
exports.remove = remove;
exports.addQueue = addQueue;


function upsert(data, callback) {
	const id = data.id || data._id || null;
	delete data.id;
	delete data._id;

	Persistent.add(type, data, id, function(result, id) {
		callback(result, id);
	});
}

function remove(id, callback) {
	Persistent.get(type, id, function(data) {
		callback(data);
	});
}

function addQueue(id, from, callback) {
	// Cache.addList(type, id, from, function(data) {
	// 	callback(data);
	// });
	callback({});
}
