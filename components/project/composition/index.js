// components/project/composition/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');
const tracKCtrl = require('../track');

function setCompositionDate(compositionData, composition) {
	if (!compositionData.date) {
		composition.date = new Date();
	}
	// TODO(jliarte): 13/07/18 else the same?
}

function setCompositionTracks(compositionData, composition, user) {
	if (compositionData.tracks && compositionData.tracks.length > 0) {
		logger.debug("setting composition " + composition._id + " tracks ", compositionData.tracks);
		return Promise.all(compositionData.tracks.map(track => {
			track.compositionId = composition._id;
			return tracKCtrl.add(track, user);
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
	setCompositionTracks(newCompositionData, newComposition, user);

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
