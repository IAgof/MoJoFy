// components/project/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../util/promisifier-utils');

const logger = require('../../logger')(module);
const config = require('../../config');

const Persistent = require('../../store/' + config.persistence_db);
const Repository = Bluebird.promisifyAll(Persistent, {promisifier: PromisifierUtils.noErrPromisifier});

const type = 'project';

// TODO(jliarte): 11/07/18 check needed indexes!
Persistent.index(type, [], logger.debug);

function upsert(newProjectData) {
	return new Promise((resolve, reject) => {
		let newProject = Object.assign({}, newProjectData);

		const id = newProject.id || newProject._id || null;
		delete newProject.id;
		delete newProject._id;

		logger.debug("project store upsert id [" + id + "] to ", config.persistence_db);
		Persistent.add(type, newProject, id, function(result, id) {
			logger.debug("Project store add persistent result ", result);
			logger.debug("Project store add persistent id ", id);
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
	get,
	remove
};