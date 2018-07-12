// components/project/composition/index.js

const extend = require('util')._extend;

const store = require('./store');
const Model = require('./model');
const logger = require('../../../logger')(module);

function add(newCompositionData, user) {
	logger.info("User ", user);
	logger.debug("...created new composition ", newCompositionData);
	newComposition = extend(newCompositionData, {});
	if (user) {
		// TODO: don't overwrite
		newComposition.created_by = user._id;
	} else {
		// TODO: reject? asset without user!
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
