// components/project/track/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');
const mediaCtrl = require('../media');

function createTrackMedias(trackData, trackId, user) {
	if (trackData.medias && trackData.medias.length > 0) {
		logger.debug("setting track " + trackId + " medias", trackData.medias);
		return Promise.all(trackData.medias.map(media => {
			media.trackId = trackId;
			return mediaCtrl.add(media, user);
		}));
	} else {
		return Promise.resolve();
	}
}

function add(newTrackData, user) {
	logger.info("User ", user);
	logger.debug("...created new track ", newTrackData);
	let newTrack = Object.assign({}, newTrackData);
	if (user && user._id) {
		// TODO: don't overwrite
		newTrack.created_by = user._id;
	} else {
		// TODO: reject? track without user!
	}

	if (!newTrackData.date) {
		newTrack.date = new Date();
	}

	const trackModel = Model.set(newTrack);
	logger.debug("track model after modelate: ", trackModel);
	trackModel.id = newTrack.id || newTrack._id || null; // TODO(jliarte): 20/07/18 manage id collisions
	return store.add(trackModel)
		.then((trackId) => {
			trackModel._id = trackId;
			createTrackMedias(newTrackData, trackId, user); // TODO(jliarte): 14/07/18 should we also chain and assign medias to track?
			delete trackModel.id;
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
