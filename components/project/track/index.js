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
	logger.info("trackController.add by User ", user);
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

function upsert(newTrackData, user) {
  logger.info("trackController.upsert by User ", user);
  return this.add(newTrackData, user);
}

function get(id, cascade) {
	logger.info("trackController.get id ", id);
	let track;
	return store.get(id)
		.then(retrievedTrack => {
			track = retrievedTrack;
			if (cascade) {
				return mediaCtrl.query({ media: { trackId: id }, cascade: cascade });
			} else {
				return [];
			}
		})
		.then(medias => {
			if (medias && medias.length > 0) {
				track.medias = medias;
			}
			return track;
		});
}

function list(user) {
	logger.info("trackController.list by User ", user);
	return store.list();
}

function setTrackMedias(tracks, mediaTracks) {
	for (let i = 0; i < tracks.length; i++) {
		if (mediaTracks[i] && mediaTracks[i].length > 0) {
			tracks[i].medias = mediaTracks[i];
		}
	}
}

function query(params, user) {
	logger.info("trackController.query by User ", user);
	logger.debug("with params ", params);
	let tracks = [];
	return store.query(params)
		.then(retrievedTracks => {
			tracks = retrievedTracks;
			if (params.cascade) {
				return Promise.all(retrievedTracks.map(track => mediaCtrl
					.query({ media: { trackId: track._id}, cascade: true })));
			}
		})
		.then(mediaTracks => {
			if (mediaTracks) {
				setTrackMedias(tracks, mediaTracks);
			}
			return tracks;
		});
}

function remove(id, cascade) {
	let retrievedTrack;
	return get(id, cascade)
		.then(res => {
			retrievedTrack = res;
			logger.debug("retrieved track is ", res);
			if (cascade && retrievedTrack && retrievedTrack.medias && retrievedTrack.medias.length > 0) {
				logger.debug("cascade!!!!!!!!!!");
				// TODO(jliarte): 8/08/18 implement remove multi in dynamo driver
				// const ids = retrievedTrack.medias.map(media => media._id);
				// return mediaCtrl.removeMulti(ids).then(res => console.log("res deleting entities ", res));
				return Promise.all(retrievedTrack.medias.map(media => mediaCtrl.remove(media._id)));
			}
		})
		.then(() => store.remove(id))
		.then(() => retrievedTrack);
}

module.exports = {
	add,
	upsert,
	get,
	list,
	query,
	remove
};
