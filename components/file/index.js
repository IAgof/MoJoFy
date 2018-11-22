const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const mime = require('mime-types');
const path = require('path');

const config = require('../../config');
const logger = require('../../logger')(module);
const Integrity = require('./integrity');

const googleCloud = require('../google-cloud');
const aws = require('../aws');

const thumbType = 'png';

let cloudStorage;
if (config.cloud_storage == 'aws') {
	cloudStorage = aws;
} else if (config.cloud_storage == 'gcloud') {
	cloudStorage = googleCloud;
}


/* Exposed functions */

exports.processUploadedVideo = processUploadedVideo;
exports.processUploadedAsset = processUploadedAsset;
exports.moveUploadedFile = moveUploadedFile;
exports.moveLocalFilePath = moveLocalFilePath;
exports.removeFromCloudStorage = removeFromCloudStorage;
exports.createFileThumbnails = createFileThumbnails;

/* Internal functions */

function processUploadedAsset(file) {
	// TODO(jliarte): 20/11/18 handle undefined file?
	logger.debug("processUploadedAsset");
	return processUploadedVideoAsync(file, config.storage_folder.asset, config.storage_folder.asset);
}

function processUploadedVideoAsync(file, thumbnailStorageFolder, videoStorageFolder) {
	logger.debug("processUploadedVideoAsync");
	if (typeof file === 'undefined') {
		return Promise.resolve("no file");
	}
	const originalFileData = getFileData(file);
	const response = {
		originalname: file.originalname,
		type: originalFileData.type,
		hash: null,
		img: null,
		video: null,
		metadata: null
	};

	logger.debug("calling promise all");
	return Promise.all([
		makeScreenshots(originalFileData),
		generateHash(originalFileData),
		getMetadata(originalFileData)
	])
		.then(values => {
			logger.debug("promise all res ", values);
			let [screenShotFileData, hash, metadata] = values;
			if (hash) {
				response.hash = hash;
			}
			response.metadata = metadata;
			return Promise.all([
				moveToCloudStorage(screenShotFileData, thumbnailStorageFolder).then(screenShotURL => {
					if (screenShotURL) {
						response.img = screenShotURL;
					}
					return screenShotURL;
				}),
				moveToCloudStorage(originalFileData, videoStorageFolder).then(url => {
					if (originalFileData.type === 'video') {
						response.video = url;
					} else {
						response.img = url;
					}
					return url;
				})])
				.then(() => response);
		});
}

function processUploadedVideo(file, callback, thumbnailStorageFolder = config.storage_folder.poster,
                              videoStorageFolder = config.storage_folder.video) {
	if (typeof(file) === 'undefined') {
		logger.error('Undefined file');
		callback('error, unrecognized file type.');
		return false;
	}

	processUploadedVideoAsync(file, thumbnailStorageFolder, videoStorageFolder)
		.then(response => callback(response, response.metadata))
		.catch(reason => {
			logger.error("Error moving to cloud storage", reason);
			callback();
		});
}

function moveUploadedFile(fileUpload, folder) {
	if (fileUpload) {
    let fileData = getFileData(fileUpload);
		return moveToCloudStorage(fileData, folder);
	}
	return Promise.resolve();
}

function moveLocalFilePath(filePath, folder) {
	if (filePath) {
		logger.debug("Move local file path", filePath);
		let fileData = getFileDataFromPath(filePath);
		return moveToCloudStorage(fileData, folder);
	}
	return Promise.resolve();
}


function removeFromCloudStorage(url) {
	if (config.cloud_storage === 'local_cloud') {
		let localFilePath = url.replace(config.local_cloud_storage_host + '/', '');
		unlink(localFilePath);
	} else {
		cloudStorage.removeFromStorage(url);
	}
}

function getFileDataFromPath(filePath) {
	const filename = filePath.substr(filePath.lastIndexOf('/') + 1, filePath.length);
	const extension = filename.substr(filename.lastIndexOf('.') + 1, filename.length);
	const contentType = mime.contentType(path.extname(filePath));
	let type;
	if (contentType) {
		type = contentType.split('/')[0];
	}
	let fileData = new FileData(filename, filePath.replace('/app/', ''), extension, type);
	return fileData;
}

function createFileThumbnails(filePath) {
	let fileData = getFileDataFromPath(filePath);
	return makeScreenshots(fileData);
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
			if (config.cloud_storage === 'local_cloud') {
				fs.rename(fileData.path, fileData.path + '.' + fileData.extension, function (err) {
					if (!err) {
						resolve(config.local_cloud_storage_host + '/' + fileData.path + '.' + fileData.extension);
					}
				});
			} else {
				cloudStorage.uploadToStorage(fileData, storageFolder).then(url => {
					unlink(fileData.path);
					resolve(url)
				});
			}
		} else {
			// ToDo: Check use cases of this flow
			resolve();
		}
	});
}

function makeScreenshots(fileData) {
	return new Promise(resolve => {
		if (fileData.type === 'video') {
			let thumbFileName = fileData.filename + '.' + thumbType;
			new ffmpeg('./' + fileData.path)
				.screenshots({
					count: 1,
					filename: thumbFileName,
					size: '560x?',
					folder: './uploads'
				})
				.on('end', function () {
					logger.info('screenshots taken');
					resolve(new FileData(thumbFileName, fileData.path + '.' + thumbType, thumbType, fileData.type)); // TODO(jliarte): 19/11/18 type should be image png
				});
		} else {
			resolve(); // TODO(jliarte): 19/11/18 or reject?
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

function getMetadata(fileData) {
	return new Promise((resolve, reject) => {
		if (fileData.type == 'video') {
			new ffmpeg.ffprobe('./' + fileData.path, function(err, metadata) {
				if (err) {
					reject(err);
				}
				logger.info('Metadata gotten');
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
