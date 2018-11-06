// store/fakelasticsearch.js

function get(type, id, cb) {
	cb(true);
}

function upsert(type, data, id, cb) {
	cb(true);
}

function remove(type, id, cb) {
	cb(true);
}

function search(type, options, cb) {
	cb([]);
}

function count(type, options, cb) {
	cb(0);
}

module.exports = {
	index: function () { return true; },
	get: get,
	query: search,
	count: count,
	add: upsert,
	update: upsert,
	upsert: upsert,
	remove: remove
};