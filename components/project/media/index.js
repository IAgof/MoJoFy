// components/project/composition/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');

const assetCtrl = require('../../asset');

function add(newMediaData, user) {
	logger.info("mediaCtrl.add by User ", user);
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

function get(mediaId) {
	return store.get(mediaId)
		.then(retrievedMedia => {
			if (retrievedMedia) {
				retrievedMedia._id = mediaId;
			}
			return retrievedMedia;
		});
}

function upsert(newMediaData, user) {
  logger.info("mediaCtrl.upsert by User ", user);
  return add(newMediaData, user);
}

function list(user) {
	logger.info("mediaCtrl.list by User ", user);
	return store.list();
}

function setMediaAsset(medias, mediaAssets) {
	for (let i = 0; i < medias.length; i++) {
		if (mediaAssets[i]) {
			medias[i].asset = mediaAssets[i];
		}
	}
}

function query(params, user) {
	logger.info("mediaCtrl.query by User ", user);
	logger.debug("with params ", params);
	let medias = [];
	return store.query(params)
		.then(retrievedMedias => {
			medias = retrievedMedias;
			if (params.cascade) {
				return Promise.all(retrievedMedias.map(media => assetCtrl.get(media.assetId)));
			}
		})
		.then(mediaAssets => {
			if (mediaAssets) {
				setMediaAsset(medias, mediaAssets);
			}
			return medias;
		});
}

function updateMediaAsset(mediaId, assetId) {
	logger.info("mediaCtrl.updateMediaAsset media [" + mediaId + "] - asset [" + assetId + "]");
	return store.get(mediaId)
		.then(media => {
			if (media) {
				if (media.assetId && media.assetId != "" && media.assetId != assetId) {
					assetCtrl.remove(media.assetId);
				}
				media.id = mediaId;
				media.assetId = assetId;
				return store.upsert(media);
			}
			return Promise.resolve();
		});
}

function remove(mediaId) {
	logger.info("mediaCtrl.remove media [" + mediaId + "]");
	let media;
	return get(mediaId)
		.then(retrievedMedia => {
			logger.debug("retrieved media to delete is ", retrievedMedia);
			media = retrievedMedia;
      return store.remove(mediaId);
    })
		.then(() => media);
}

function removeMulti(mediaIds) {
	logger.info("mediaCtrl.removeMulti medias ", mediaIds);
	// TODO(jliarte): 9/08/18 should return removed medias?
	return store.removeMulti(mediaIds);
}

module.exports = {
	add,
	get,
	upsert,
	list,
	query,
	updateMediaAsset,
	remove,
	removeMulti
};
