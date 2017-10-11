
const Persistent = require('../../store/datastore');
// const Cache = require('../../store/redis');

const type = 'achievement';

exports.upsert = upsert;
exports.remove = remove;


function upsert(data, callback) {
	const id = data.id || data._id || null;

	Persistent.add(type, data, id, function(result, id) {
		callback(result, id);
	});
}

function remove(id, callback) {
	Persistent.get(type, id, function(data) {
		callback(data);
	});
}
