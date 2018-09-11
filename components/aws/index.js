const fs = require('fs');
const s3 = require("./s3");
const logger = require('../../logger')(module);
const config = require('../../config');

exports.uploadToStorage = uploadToStorage;
exports.removeFromStorage = removeFromStorage;

function uploadToStorage(fileData, storageFolder) {
	logger.debug("[S3] Uploading to S3", fileData);
	return getFileBuffer("/app/" + fileData.path)
		.then(fileBuffer => {
			logger.debug("[S3] buffer created");
			return s3.upload(storageFolder + '/' + fileData.filename + '.' + fileData.extension, fileBuffer);
		}).then(response => {
			logger.debug("[S3] got response " + response);
			let replacePath = 's3.amazonaws.com';
			if (config.aws_region !== 'us-east-1') {
				replacePath = config.aws_region + '.' + replacePath;
			}
			return response.Location.replace(replacePath + '/' + config.storage_bucket, config.cdn_path);
		});
}

function removeFromStorage(url) {
	if (url && url.indexOf(config.cdn_path) > -1) {
		let path = url.split(config.cdn_path + '/')[1];
		return s3.remove(path)
			.catch(error => {
				throw error;
			});
	} else {
		logger.debug("AWS.removeFromStorage - Unable to remove Provided url [" + url + "] resolving promise");
		return Promise.resolve();
	}
}

function getFileBuffer(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, function (error, data) {
			if (error) {
				logger.error("[S3] Error creating buffer for path", path);
				return reject(error.message);
			} else {
				resolve(new Buffer(data, 'binary'));
			}
		});
	});
}