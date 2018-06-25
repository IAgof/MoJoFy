const extend = require('util')._extend;

const store = require('./store');

const logger = require('../../logger');
const Config = require('../../config');
const FileUpload = require('../file');

const Model = require('./model');

function add(newCompositionData, user) {
	logger.info("User ", user);
	logger.debug("...created new composition ", newCompositionData);
	newComposition = extend(newCompositionData, {});
	if (user) {
		// TODO: don't overwrite
		newComposition.created_by = user.sub;
	} else {
		// TODO: reject? composition without user!
	}

	if (!newCompositionData.date) {
		newComposition.date = new Date();
	}
	const compositionModel = Model.set(newComposition);
	logger.debug("composition model after modelate: ", compositionModel);
	return store.add(compositionModel)
		.then(() => { return compositionModel });
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
