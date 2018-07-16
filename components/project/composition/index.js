// components/project/composition/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');
const trackCtrl = require('../track');

function setCompositionDate(compositionData, composition) {
	if (!compositionData.date) {
		composition.date = new Date();
	}
	// TODO(jliarte): 13/07/18 else the same?
}

function createCompositionTracks(compositionData, compositionId, user) {
	if (compositionData.tracks && compositionData.tracks.length > 0) {
		logger.debug("setting composition " + compositionId + " tracks ", compositionData.tracks);
		return Promise.all(compositionData.tracks.map(track => {
			track.compositionId = compositionId;
			return trackCtrl.add(track, user);
		}));
	} else {
		return Promise.resolve();
	}
}

function add(newCompositionData, user) {
	logger.info("User ", user);
	logger.debug("...created new composition ", newCompositionData);
	let newComposition = Object.assign({}, newCompositionData);
	if (user) {
		// TODO: don't overwrite
		newComposition.created_by = user._id;
	} else {
		// TODO: reject? asset without user!
	}

	setCompositionDate(newCompositionData, newComposition);

	const compositionModel = Model.set(newComposition);
	logger.debug("composition model after modelate: ", compositionModel);
	return store.add(compositionModel)
		.then((compositionId) => {
			compositionModel._id = compositionId;
			createCompositionTracks(newCompositionData, compositionId, user); // TODO(jliarte): 14/07/18 should we also chain?
			return compositionModel;
		});
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
