const logger = require('../../logger');
const config = require('../../config');

const Persistent = require('../../store/' + config.persistence_db);
const Search = require('../../store/' + config.search_db);
// const Cache = require('../../store/redis');

const type = 'video';

Persistent.index(type, []);
// Search.index(type, []);

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
				logger.debug(resultSearch);
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
		logger.debug(data);
	});
}
