// components/asset/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../util/promisifier-utils');

const logger = require('../../logger')(module);
const config = require('../../config');
const insertFilter = require('../../store/store-util').insertFilter;

const Persistent = require('../../store/' + config.persistence_db);
const Repository = Bluebird.promisifyAll(Persistent, { promisifier: PromisifierUtils.noErrPromisifier });

const type = 'asset';

// TODO(jliarte): 11/07/18 check needed indexes!
// TODO(jliarte): 21/11/18 hash index need ordering key created_by!! created by hand in aws console
Persistent.index(type, ['projectId', 'hash', 'created_by'], logger.debug);

function upsert(newAssetData) {
	let newAsset = Object.assign({}, newAssetData);
	return new Promise((resolve, reject) => {
		const id = newAsset.id || newAsset._id || null;
		delete newAsset.id;
		delete newAsset._id;

		logger.debug("asset store upsert to ", config.persistence_db);
		Persistent.add(type, newAsset, id, function(result, id) {
			// logger.debug("asset store add persistent result ", result);
			// logger.debug("asset store add persistent id ", id);
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
	return Repository.queryAsync(type, {});
}

function query(params) {
	const queryParams = {};
	if (params.asset) {
		// build filter by specification
		if (params.asset.hash && typeof params.asset.hash === 'string') {
			insertFilter('hash', '=', params.asset.hash, queryParams);
		}
		if (params.asset.created_by && typeof params.asset.created_by === 'string') {
			insertFilter('created_by', '=', params.asset.created_by, queryParams);
		}
	}
	return Repository.queryAsync(type, queryParams);

}

function get(id) {
	return new Promise((resolve, reject) => {
		Persistent.get(type, id, function(data) {
			resolve(data);
		});
	});
	// return Repository.getAsync(id);
}

function remove(id) {
	return Repository.removeAsync(type, id);
}


module.exports = {
	add: upsert,
	upsert,
	list,
	query,
	get,
	remove
};