// components/project/index.js

const extend = require('util')._extend;

const logger = require('../../logger')(module);

const Model = require('./model');

function add(newProjectData, user) {
	logger.info("User ", user);
	logger.debug("...created new project ", newProjectData);
	return new Promise((resolve, reject) => {
		let newProject = extend(newProjectData, {});
		if (!newProjectData.date) {
			newProject.date = new Date();
		}
		// TODO: don't overwrite
		newProject.created_by = user.sub; // token.sub
		const projectModel = Model.set(newProject);
		logger.debug("project model after modelate: ", projectModel);

		return store.add(projectModel);

		// getEventById(newEvent.id)
		// 	.then(existingEvent => {
		// 		reject({status: 409, message: `Event id ${newEvent.id} already exists`})
		// 	}).catch(err => {
		// 		const createdEvent = new Event(newEvent.id, newEvent.title, newEvent.description, Date.now());
		// 		events.push(createdEvent);
		// 		resolve(createdEvent);
		// });
	})
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
