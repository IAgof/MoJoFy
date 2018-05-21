const fs = require('fs');
const s3 = require("./s3");
const logger = require('../../logger');
const config = require('../../config');

exports.uploadToStorage = uploadToStorage;
exports.removeFromStorage = removeFromStorage;

function uploadToStorage(fileData, storageFolder) {
	return getFileBuffer("/app/" + fileData.path)
		.then(fileBuffer => {
			return s3.upload(storageFolder + '/' + fileData.filename + '.' + fileData.extension, fileBuffer);
		}).then(response => {
			let replacePath = 's3.amazonaws.com';
			if (config.aws_region !== 'us-east-1') {
				replacePath = config.aws_region + '.' + replacePath;
			}
			return response.Location.replace(config.storage_bucket + '.' + replacePath, config.cdn_path);
		});
}

function removeFromStorage(url) {
	let path = url.split(config.cdn_path + '/')[1];
	return s3.remove(path)
		.catch(error => {
			throw error;
		});
}

function getFileBuffer(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, function (error, data) {
			if (error) {
				return reject(error.message);
			} else {
				resolve(new Buffer(data, 'binary'));
			}
		});
	});
}