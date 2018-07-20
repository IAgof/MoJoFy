// components/project/composition/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');

function add(newMediaData, user) {
	logger.info("User ", user);
	logger.debug("...created new media ", newMediaData);
	let newMedia = Object.assign({}, newMediaData);
	if (user) {
		// TODO: don't overwrite
		newMedia.created_by = user._id;
	} else {
		// TODO: reject? media without user!
	}

	const mediaModel = Model.set(newMedia);
	logger.debug("media model after modelate: ", mediaModel);
	mediaModel.id = newMedia.id || newMedia._id || null; // TODO(jliarte): 20/07/18 manage id collisions
	return store.add(mediaModel)
		.then((mediaId) => {
			delete mediaModel.id;
			mediaModel._id = mediaId;
			return mediaModel;
		});
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
