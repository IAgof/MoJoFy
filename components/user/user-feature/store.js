// components/user/user-feature/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const logger = require('../../../logger')(module);
const config = require('../../../config');
const insertFilter = require('../../../store/store-util').insertFilter;

const Persistent = require('../../../store/' + config.persistence_db);
const Repository = Bluebird.promisifyAll(Persistent, { promisifier: PromisifierUtils.noErrPromisifier });

const type = 'user-feature';

// TODO(jliarte): 11/07/18 check needed indexes!
Persistent.index(type, ['userId', 'name', 'plan'], logger.debug);

function upsert(newUserFeatureData) {
	let newUserFeature = Object.assign({}, newUserFeatureData);
	return new Promise((resolve, reject) => {
		const id = newUserFeature.id || newUserFeature._id || null;
		delete newUserFeature.id;
		delete newUserFeature._id;

		logger.debug("userFeature store upsert to ", config.persistence_db);
		Persistent.add(type, newUserFeature, id, function(result, id) {
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
	if (params.userFeature) {
		// build filter by specification
		if (params.userFeature.name && typeof params.userFeature.name === 'string') {
			insertFilter('name', '=', params.userFeature.name, queryParams);
		}
		if (params.userFeature.userId && typeof params.userFeature.userId === 'string') {
			insertFilter('userId', '=', params.userFeature.userId, queryParams);
		}
		if (params.userFeature.plan && typeof params.userFeature.plan === 'string') {
			insertFilter('plan', '=', params.userFeature.plan, queryParams);
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