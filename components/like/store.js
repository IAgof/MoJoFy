const logger = require('../../logger')(module);
const config = require('../../config');
const Persistent = require('../../store/' + config.persistence_db);

const type = 'like';

Persistent.index(type, [], logger.debugº);

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
