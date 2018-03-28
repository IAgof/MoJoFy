
const Persistent = require('../../store/datastore');
const Search = require('../../store/elasticsearch');
// const Cache = require('../../store/redis');

const type = 'video';

exports.get = get;
exports.list = list;
exports.upsert = upsert;
exports.remove = remove;
exports.count = count;


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

	Search.query(type, params, function(data) {
		callback(data);
	});
}

function upsert(data, callback) {
	const id = data.id || data._id || null;
	delete data.id;
	delete data._id;

	Persistent.add(type, data, id, function(result, id) {
		callback(result, id);
		if (result) {
			Search.add(type, data, id, function(resultSearch, idSearch) {
				console.log(resultSearch);
			});
		}
	});
}

function count(query, callback) {
	Search.count(type, query, function(data) {
		callback(data);
	});
}

function remove(id, callback) {
	Persistent.remove(type, id, function(data) {
		callback(data);
	});
	Search.remove(type, id, function(data) {
		console.log(data);
	});
}
