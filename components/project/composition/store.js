// components/project/composition/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const logger = require('../../../logger')(module);
const config = require('../../../config');

const Persistent = require('../../../store/' + config.persistence_db);
const assetRepo = Bluebird.promisifyAll(Persistent, { promisifier: PromisifierUtils.noErrPromisifier });

const type = 'composition';

// TODO(jliarte): 11/07/18 check needed indexes!
Persistent.index(type, [], logger.debug);

function upsert(newCompositionData) {
	let newComposition = Object.assign({}, newCompositionData);
	return new Promise((resolve, reject) => {
		const id = newComposition.id || newComposition._id || null;
		delete newComposition.id;
		delete newComposition._id;

		logger.debug("composition store upsert to ", config.persistence_db);
		Persistent.add(type, newComposition, id, function(result, id) {
			logger.debug("composition store add persistent result ", result);
			logger.debug("composition store add persistent id ", id);
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
	return assetRepo.queryAsync(type, {});
}

function get(id) {
	return new Promise((resolve, reject) => {
		Persistent.get(type, id, function(data) {
			resolve(data);
		});
	});
	// return assetRepo.getAsync(id);
}

function remove(id) {
	return assetRepo.removeAsync(type, id);
}


module.exports = {
	add: upsert,
	upsert,
	list,
	get,
	remove
};