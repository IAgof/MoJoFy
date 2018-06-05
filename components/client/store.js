const Persistent = require('../../store/datastore');

const type = 'client';

exports.get = get;
exports.list = list;
exports.upsert = upsert;
exports.delete = remove;


function get(id, callback) {
	Persistent.get(type, id, function(data) {
		callback(data);
	});
}

function list(params, callback) {
	Persistent.query(type, params, function(data) {
		callback(data);
	});
}

function upsert(data, callback) {
	const id = data.id || data._id || null;
	delete data.id;
	delete data._id;

	Persistent.upsert(type, data, id, function(result, id) {
		callback(result, id);
	});
}

function remove(id, callback) {
	Persistent.remove(type, id, function(data) {
		callback(data);
	});
}
