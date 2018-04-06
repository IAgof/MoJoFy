const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const CloudStorage = require('cloud-storage');

const config = require('../../config');
const logger = require('../../logger');
const Integrity = require('./integrity');

const storage = new CloudStorage({
	accessId: config.storage_accessId,
	privateKey: config.storage_keyFilename
});

const thumbType = 'png';


/* Exposed functions */

exports.processUploadedVideo = processUploadedVideo;
exports.moveUpladedFile = moveUploadedFile;
exports.removeFromCloudStorage = removeFromCloudStorage;

/* Internal functions */

function processUploadedVideo(file, callback) {
	if (typeof(file) === 'undefined') {
		logger.error('Undefined file');
		callback('error, unrecognized file type.');
		return false;
	}

	const originalFileData = getFileData(file);
	const response = {
		originalname: file.originalname,
		type: originalFileData.type,
		hash: null,
		img: null,
		video: null
	};

	Promise.all([
			makeScreenshots(originalFileData),
			generateHash(originalFileData),
			getMetadata(originalFileData)
		])
		.then(values => {
			let [screenShotFileData, hash, metadata] = values;
			if (hash) {
				response.hash = hash;
			}
			Promise.all([
				moveToCloudStorage(screenShotFileData).then(screenShotURL => {
					if (screenShotURL) {
						response.img = screenShotURL;
					}
				}),
				moveToCloudStorage(originalFileData).then(url => {
					if (originalFileData.type === 'video') {
						response.video = url;
					} else {
						response.img = url;
					}
				})])
				.then(values => {
					callback(response, metadata);
				})
				.catch(reason => {
					logger.error("Error moving to cloud storage", reason);
				})
		});
}

function moveUploadedFile(fileUpload) {
	let fileData = getFileData(fileUpload);
	return moveToCloudStorage(fileData);
}

function removeFromCloudStorage(url) {
	if (config.cloud_storage === 'gcloud') {
		// TODO(jliarte): remove from cloud
	} else {
		let localFilePath = url.replace(config.local_cloud_storage_host + '/', '');
		logger.debug("local path is ", localFilePath);
	}
}

class FileData {
	constructor(filename, path, extension, type) {
		this.filename = filename;
		this.path = path;
		this.extension = extension;
		this.type = type;
	}
}

function getFileData(file) {
	const path = file.path.replace('\\', '/');	// Clean strange bars in file path
	const fileDot = file.originalname.split('.');
	const fileExtension = fileDot[fileDot.length - 1].toLowerCase();
	const filetype = file.mimetype.split('/')[0];

	return new FileData(file.filename, path, fileExtension, filetype);
}

function moveToCloudStorage(fileData, storageFolder) {
	return new Promise(resolve => {
		if (fileData) {
			logger.debug("Move to cloud storage filedata: ", fileData);
			if (config.cloud_storage === 'gcloud') {
				let remotePath = '/' + storageFolder + '/'
					+ fileData.filename.substring(0, 2) + '/' + fileData.filename.substring(2, 4) + '/'
					+ fileData.filename + '.' + fileData.extension;
				copyToGCloudStorage(remotePath, fileData.path).then(url => {
					unlink(url.path);
					resolve(url)
				});
			} else {
				fs.rename(fileData.path, fileData.path + '.' + fileData.extension, function (err) {
					if (!err) {
						resolve(config.local_cloud_storage_host + '/' + fileData.path + '.' + fileData.extension);
					}
				})
			}
		}
	});
}

function copyToGCloudStorage(remotePath, localPath) {
	return new Promise((resolve, reject) => {
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
	})

}

function makeScreenshots(fileData, callback) {
	return new Promise(resolve => {
		if (fileData.type == 'video') {
			let thumbFileName = fileData.filename + '.' + thumbType;
			new ffmpeg('./' + fileData.path)
				.screenshots({
					count: 1,
					filename: thumbFileName,
					folder: './uploads'
				})
				.on('end', function () {
					logger.info('screenshots taken');
					resolve(new FileData(thumbFileName, fileData.path + '.' + thumbType, thumbType, fileData.type));
				});
		}
	});
}

function generateHash(fileData) {
	return new Promise(resolve => {
		Integrity.hash(fileData.path, function (hash) {
			logger.debug("Hash generated");
			resolve(hash);
		});
	});
}

function getMetadata(fileData, callback) {
	return new Promise((resolve, reject) => {
		if (fileData.type == 'video') {
			new ffmpeg.ffprobe('./' + fileData.path, function(err, metadata) {
				if (err) {
					reject(err);
				}
				logger.info('Metadata gotten');
				logger.info(metadata);
				resolve(metadata);
			});
		}
	});
}

function unlink(path) {
	logger.debug("Removing file: " + path);
	fs.unlink('./' + path, function (fserr) {
		if (fserr) {
			logger.error('Remove image error:');
			logger.error(fserr);
		}
	});
}
