const fs = require('fs');
const s3 = require("./s3");
const logger = require('../../logger');

exports.uploadToStore = uploadToStore;
exports.removeFromStore = removeFromStore;

function uploadToStore(fileData) {
//	let remotePath = '/' + storageFolder + '/'
//					+ fileData.filename.substring(0, 2) + '/' + fileData.filename.substring(2, 4) + '/'
//					+ fileData.filename + '.' + fileData.extension;
//	let localPath = fileData.path;
//	return File.get(file)
//		.then(response => {
//			return s3.upload(remotePath, response, name);
//		}).catch(error => {
//			throw error;
//		});
//	let file = {
//		path: fileData.path,
//		remotePath: "http://cloudfront...."
//	};
	logger.info(fileData);
	logger.info("/app/" + fileData.path);
	return getFileBuffer("/app/" + fileData.path)
		.then(fileBuffer => {
			return s3.upload('/', fileBuffer);
		}).then(response => {
			logger.info(response);
			return {
				path: response
			};
		}).catch(error => {
			throw new Error(error.message);
		});
}

function removeFromStore(url) {
	console.log(url);
	return Promise.resolve();
//	return s3.remove(url)
//		.catch(error => {
//			throw error;
//		});
}

function getFileBuffer(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, function (error, data) {
			if (error) {
				throw new Error(error.message);
			} else {
				resolve(new Buffer(data, 'binary'));
			}
		});
	});
}