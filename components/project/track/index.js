// components/project/track/index.js

const extend = require('util')._extend;

const store = require('./store');
const Model = require('./model');
const logger = require('../../../logger')(module);

function add(newTrackData, user) {
	logger.info("User ", user);
	logger.debug("...created new track ", newTrackData);
	let newTrack = extend(newTrackData, {});
	if (user) {
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
		.then(() => { return trackModel });
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
