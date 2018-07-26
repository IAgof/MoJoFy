// components/asset/index.js

const store = require('./store');

const logger = require('../../logger')(module);
const Config = require('../../config');
const FileUpload = require('../file');
const mediaCtrl = require('../project/media');

const Model = require('./model');

function updateMediaAsset(newAssetData, assetId) {
    if (newAssetData.mediaId && newAssetData.mediaId != "") {
        mediaCtrl.updateMediaAsset(newAssetData.mediaId, assetId);
    }
}

function add(newAssetData, user) {
	logger.info("User ", user);
	logger.debug("...created new asset ", newAssetData);
	let newAsset = Object.assign({}, newAssetData);
	if (user) {
		// TODO: don't overwrite
		newAsset.created_by = user._id;
	} else {
		// TODO: reject? asset without user!
	}

	if (!newAssetData.date) {
		newAsset.date = new Date();
	}
	// TODO: all mimetypes
	logger.debug("Asset file is ", newAsset.file);
	return FileUpload.moveUploadedFile(newAsset.file, Config.storage_folder.asset)
		.then(url => {
			logger.debug("New asset processed with results", url);
			if (url) {
				newAsset.uri = url;
				newAsset.filename = newAsset.file.originalname;
				newAsset.mimetype = newAsset.file.mimetype;
			}

			const assetModel = Model.set(newAsset);
			logger.debug("asset model after modelate: ", assetModel);
            assetModel.id = newAssetData.id || newAssetData._id || null; // TODO(jliarte): 20/07/18 manage id collisions
            return store.add(assetModel)
				.then((assetId) => {
					updateMediaAsset(newAssetData, assetId);
					delete assetModel.id;
					assetModel._id = assetId;
					return assetModel
				});
		});
}

function list() {
	return store.list();
}

function remove(id) {
	let deletedAsset;
	return store.get(id)
		.then(asset => {
			deletedAsset = asset;
			return store.remove(id);
		}).then(res => {
			logger.debug("removing asset [" + id + "] result ", res);
			if (res) {
				deletedAsset._id = id;
				return deletedAsset;
			} else {
				return false; // TODO(jliarte): 26/07/18 reject, resolve or throw?
			}
		});
}

module.exports = {
	add,
	list,
	remove
};
