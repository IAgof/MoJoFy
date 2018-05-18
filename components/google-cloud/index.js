const CloudStorage = require('cloud-storage');
const config = require('../../config');
const logger = require('../../logger');

const storage = new CloudStorage({
	accessId: config.storage_accessId,
	privateKey: config.storage_keyFilename
});

exports.uploadToStorage = uploadToStorage;
exports.removeFromStorage = removeFromStorage;

function uploadToStorage(fileData, storageFolder) {
	let remotePath = '/' + storageFolder + '/';
	
	return new Promise((resolve, reject) => {
		let remotePath = '/' + storageFolder + '/'
					+ fileData.filename.substring(0, 2) + '/' + fileData.filename.substring(2, 4) + '/'
					+ fileData.filename + '.' + fileData.extension;
		let localPath = fileData.path;
		const bucket = 'gs://' + config.storage_bucket + remotePath;
		storage.copy('./' + localPath, bucket, function (err, url) {
			if (err) {
				logger.error('Error copying file:');
				logger.error(err);
				reject();
			}
			logger.info('file uploaded');
			resolve(url);
		});
	});
}

function removeFromStorage(url) {
	let cloudFilePath = url.split('googleapis.com')[1];
	const bucketName = 'gs://' + config.storage_bucket + cloudFilePath;
	const bucket = storage.bucket(bucketName);
	const file = bucket.file(cloudFilePath);
	return file.delete();
}