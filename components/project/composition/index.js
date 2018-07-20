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
	logger.info("compositionCtrl.add by User ", user);
	logger.debug("...created new composition ", newCompositionData);
	let newComposition = Object.assign({}, newCompositionData);
	if (user) {
		// TODO: don't overwrite
		newComposition.created_by = user._id;
	} else {
		// TODO: reject? composition without user!
	}

	setCompositionDate(newCompositionData, newComposition);

	const compositionModel = Model.set(newComposition);
	logger.debug("composition model after modelate: ", compositionModel);
	compositionModel.id = newComposition.id || newComposition._id || null; // TODO(jliarte): 20/07/18 manage id collisions

	return store.add(compositionModel)
		.then((compositionId) => {
			compositionModel._id = compositionId;
			createCompositionTracks(newCompositionData, compositionId, user); // TODO(jliarte): 14/07/18 should we also chain and assign tracks to composition?
			delete compositionModel.id;
			return compositionModel;
		});
}

function update(compositionData, user) {
	logger.info("compositionCtrl.update by User ", user);
	logger.debug("...updated composition id [" + compositionData.id + "]", compositionData);
	let composition = Object.assign({}, compositionData);
	if (user && !composition.created_by) {
		// TODO: don't overwrite
		composition.created_by = user._id;
	} else {
		// TODO: reject? composition without user!
	}

	setCompositionDate(compositionData, composition);

	const compositionModel = Model.set(composition);
	compositionModel.id = compositionData.id || compositionData._id;
	logger.debug("composition model after modelate: ", compositionModel);
	return store.upsert(compositionModel)
		.then((compositionId) => {
			compositionModel._id = compositionId;
			// TODO(jliarte): 19/07/18 change for update when uuid collision is managed
			createCompositionTracks(compositionData, compositionId, user); // TODO(jliarte): 14/07/18 should we also chain and assign tracks to composition?
			delete compositionModel.id;
			return compositionModel;
		});
}

function list() {
	return store.list();
}

module.exports = {
	add,
	update,
	list
};
