const Bluebird = require('bluebird');
const PromisifierUtils = require('../../test/utils/promisifier-utils');

const logger = require('../../logger');
const config = require('../../config');

const Persistent = require('../../store/' + config.persistence_db);
const projectRepo = Bluebird.promisifyAll(Persistent, {promisifier: PromisifierUtils.noErrPromisifier});

const type = 'project';

Persistent.index(type, []), logger.debug;

function upsert(newProject) {
	return new Promise((resolve, reject) => {
		const id = newProject.id || newProject._id || null;
		delete newProject.id;
		delete newProject._id;

		logger.debug("project store upsert to ", config.persistence_db);
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
	return projectRepo.queryAsync(type, {});
}

function get(id) {
	return new Promise((resolve, reject) => {
		Persistent.get(type, id, function(data) {
			resolve(data);
		});
	});
	// return projectRepo.getAsync(id);
}

function remove(id) {
	return projectRepo.removeAsync(type, id);
}


module.exports = {
	add: upsert,
	upsert,
	list,
	get,
	remove
};