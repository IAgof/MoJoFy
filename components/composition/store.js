const Bluebird = require('bluebird');
const PromisifierUtils = require('../../test/utils/promisifier-utils');

const logger = require('../../logger');
const config = require('../../config');

const Persistent = require('../../store/' + config.persistence_db);
const compositionRepo = Bluebird.promisifyAll(Persistent, {promisifier: PromisifierUtils.noErrPromisifier});

const type = 'composition';

Persistent.index(type, []), logger.debug;

function upsert(newComposition) {
	return new Promise((resolve, reject) => {
		const id = newComposition.id || newComposition._id || null;
		delete newComposition.id;
		delete newComposition._id;

		logger.debug("Composition store upsert to ", config.persistence_db);
		Persistent.add(type, newComposition, id, function(result, id) {
			if (result) {
				resolve(id);
			} else {
				// TODO: when does error occur????
				reject();
			}
		});
	});
}

function list() {
	return compositionRepo.queryAsync(type, {});
}

function get(id) {
	return new Promise((resolve, reject) => {
		Persistent.get(type, id, function(data) {
			resolve(data);
		});
	});
	// return compositionRepo.getAsync(id);
}

function remove(id) {
	return compositionRepo.removeAsync(type, id);
}


module.exports = {
	add: upsert,
	upsert,
	list,
	get,
	remove
};