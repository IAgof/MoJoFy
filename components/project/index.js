// components/project/index.js

const store = require('./store');
const Model = require('./model');
const logger = require('../../logger')(module);

function add(newProjectData, user) {
	logger.info("User ", user);
	logger.debug("...created new project ", newProjectData);
	let newProject = Object.assign({}, newProjectData);
	if (!newProjectData.date) {
		newProject.date = new Date();
	}
	// TODO: don't overwrite
	if (user) {
		newProject.created_by = user._id;
	}
	const projectModel = Model.set(newProject);
	logger.debug("project model after modelate: ", projectModel);

	return store.add(projectModel)
		.then(projectId => {
			projectModel._id = projectId;
			return projectModel;
		});

	// getEventById(newEvent.id)
	// 	.then(existingEvent => {
	// 		reject({status: 409, message: `Event id ${newEvent.id} already exists`})
	// 	}).catch(err => {
	// 		const createdEvent = new Event(newEvent.id, newEvent.title, newEvent.description, Date.now());
	// 		events.push(createdEvent);
	// 		resolve(createdEvent);
	// });
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
