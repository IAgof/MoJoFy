const assetCtrl = require('../../components/asset');
const assetStore = require('../../components/asset/store');
const fileCtrl = require('../../components/file');
const config = require('../../config');
const logger = require('../../logger')(module);

const download = require('download-file');

module.exports = {
	updateAssetThumb,
	downloadAssetVideo,
};

function downloadAssetVideo(asset) {
	return new Promise((resolve, reject) => {
		if (!asset.uri) {
			return resolve();
		}

		const options = {
			directory: config.upload_folder,
		};
		download(asset.uri, options, function(err){
			if (err) return reject(err);
			console.log("download completed");
			const fileName = asset.uri.substr(asset.uri.lastIndexOf('/') + 1, asset.uri.length);
			resolve(options.directory + fileName);
		})
	});
}

function updateAssetThumb(asset) {
	let downloadedVideo;
	return downloadAssetVideo(asset)
		.then(path => {
			downloadedVideo = path;
			return fileCtrl.createFileThumbnails(path);
		})
		.then(fileData => {
			logger.debug("thumbanils created, res ", fileData);
			if (fileData && fileData.path) {
				return fileCtrl.moveLocalFilePath(fileData.path, config.storage_folder.asset); // TODO(jliarte): 20/11/18 create a folder for asset screenshots?
			}
			return;
		})
		.then(url => {
			logger.debug("uploaded thumbnail, url ", url);
			if (url) {
				asset.thumbnail = url;
				return assetStore.upsert(asset);
			}
			return;
		});
// TODO(jliarte): 20/11/18 finally delete downloaded video!
}