const Persistent = require('../../store/datastore');

const type = 'distribute';

// Persistent.index(type, ['video']);

exports.get = get;
exports.list = list;
exports.upsert = upsert;


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

	Persistent.add(type, data, id, function(result, id) {
		callback(result, id);
	});
}
