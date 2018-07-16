// components/project/track/index.js

const store = require('./store');
const Model = require('./model');
const logger = require('../../../logger')(module);

function add(newTrackData, user) {
	logger.info("User ", user);
	logger.debug("...created new track ", newTrackData);
	let newTrack = Object.assign({}, newTrackData);
	if (user && user._id) {
		// TODO: don't overwrite
		newTrack.created_by = user._id;
	} else {
		// TODO: reject? asset without user!
	}

	if (!newTrackData.date) {
		newTrack.date = new Date();
	}

	const trackModel = Model.set(newTrack);
	logger.debug("track model after modelate: ", trackModel);
	return store.add(trackModel)
		.then((trackId) => {
			trackModel._id = trackId;
			return trackModel
		});
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
