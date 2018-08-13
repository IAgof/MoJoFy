// components/project/composition/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const logger = require('../../../logger')(module);
const config = require('../../../config');
const insertFilter = require('../../../store/store-util').insertFilter;

const Persistent = require('../../../store/' + config.persistence_db);
const Repository = Bluebird.promisifyAll(Persistent, { promisifier: PromisifierUtils.noErrPromisifier });

const type = 'media';

// TODO(jliarte): 11/07/18 check needed indexes!
Persistent.index(type, [], logger.debug);

function upsert(mediaData) {
	let media = Object.assign({}, mediaData);
	return new Promise((resolve, reject) => {
		const id = media.id || media._id || null;
		delete media.id;
		delete media._id;

		logger.debug("media store upsert to ", config.persistence_db);
		Persistent.upsert(type, media, id, function(result, id) {
			logger.debug("media store add persistent result ", result);
			logger.debug("media store add persistent id ", id);
			if (result) {
				resolve(id);
			} else {
				// TODO: when does error occur????
				logger.error("Error upserting media into ", config.persistence_db);
				reject();
			}
		});
	});
}

function list() {
	return Repository.queryAsync(type, {});
}

function get(id) {
	return new Promise((resolve, reject) => {
		Persistent.get(type, id, function(data) {
			resolve(data);
		});
	});
	// return Repository.getAsync(id);
}

function query(params) {
	const queryParams = {};
	if (params.media) {
		// build filter by specification
		if (params.media.trackId && typeof params.media.trackId === 'string') {
			insertFilter('trackId', '=', params.media.trackId, queryParams);
		}
	}
	return Repository.queryAsync(type, queryParams);
}

function remove(id) {
	return Repository.removeAsync(type, id);
}

function removeMulti(ids) {
	return Repository._removeMulti(type, ids);
}

module.exports = {
	add: upsert,
	upsert,
	list,
	query,
	get,
	remove,
	removeMulti
};