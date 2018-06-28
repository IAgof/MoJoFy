const logger = require('../../logger')(module);
const config = require('../../config');
const Persistent = require('../../store/' + config.persistence_db);

const type = 'download_code';

Persistent.index(type, ['video', 'code'], logger.debug);

exports.query = query;
exports.upsert = upsert;

function query(params, callback) {
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
