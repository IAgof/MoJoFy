const extend = require('util')._extend;

const store = require('./store');

const logger = require('../../logger');
const Config = require('../../config');
const FileUpload = require('../file');

const Model = require('./model');

function add(newAssetData, user) {
	logger.info("User ", user);
	logger.debug("...created new asset ", newAssetData);
	newComposition = extend(newAssetData, {});
	if (user) {
		// TODO: don't overwrite
		newComposition.created_by = user.sub;
	} else {
		// TODO: reject? asset without user!
	}

	if (!newAssetData.date) {
		newComposition.date = new Date();
	}
	// TODO: all mimetypes
	logger.debug("Asset file is ", newComposition.file);
	return FileUpload.moveUploadedFile(newComposition.file, Config.storage_folder.asset)
		.then(url => {
			logger.debug("New asset processed with results", url);
			if (url) {
				newComposition.uri = url;
				newComposition.filename = newComposition.file.originalname;
				newComposition.mimetype = newComposition.file.mimetype;
			}

			const assetModel = Model.set(newComposition);
			logger.debug("asset model after modelate: ", assetModel);
			return store.add(assetModel)
				.then(() => { return assetModel });
		});
}

function list() {
	return store.list();
}

module.exports = {
	add,
	list
};
