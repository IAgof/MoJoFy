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


/* Exposed functions */

exports.move = uploadFile;


/* Internal functions */

function uploadFile(file, callback) {
	if (typeof(file) === 'undefined') {
		logger.error('Undefined file');
		callback('error');
		return false;
	}

	const path = file.path.replace('\\', '/');	// Clean extrange bars in file path
	const fileDot = file.originalname.split('.');
	const fileExtension = fileDot[fileDot.length - 1].toLowerCase();
	const filetype = file.mimetype.split('/')[0];

	const fileData = {
		file: file,
		path: path,	
		extension: fileExtension,
		type: filetype 
	};

	const response = {
		originalname: file.originalname,
		type: filetype,
		hash: null,
		img: null,
		video: null
	};

	var ops = 2;
	var responses = 0;

	if (filetype === 'video') {
		ops = 3;
		makeScreenshots(fileData, function(url) {
			if (url) {
				response.img = url;
			}
			if(++responses === ops) {
				end(path, response, callback);
			}
		});	
	}

	moveToGCloudStorage(fileData, function(url) {
        if (fileData.type === 'video') {
            response.video = url;
        } else {
            response.img = url;
        }
		if(++responses === ops) {
			end(path, response, callback);
		}
	});

	generateHash(fileData, function(hash) {
		if (hash) {
            response.hash = hash;
        }
		if(++responses === ops) {
			end(path, response, callback);
		}
	});
}


function moveToGCloudStorage(fileData, callback) {
    const localVideoPath = fileData.path;
	if (config.cloud_storage === 'gcloud') {
        const bucket = 'gs://'+ config.storage_bucket +'/'+ config.storage_folder[fileData.type] +'/'
			+ fileData.file.filename.substring(0, 2) +'/'+ fileData.file.filename.substring(2, 4) +'/'
			+ fileData.file.filename +'.'+ fileData.extension;
        logger.debug('Moving to google cloud', bucket);

        storage.copy('./' + localVideoPath, bucket, function(err, url) {
            if (err) {
                logger.error('Error copying image file:');
                logger.error(err);
                callback();
                return false;
            }
            logger.info('file uploaded');
            callback(url);
        });
	} else {
		callback(config.local_cloud_storage_host + localVideoPath);
	}
}

function makeScreenshots(fileData, callback) {
	new ffmpeg('./' + fileData.path)
		.on('end', function () {
			logger.info('screenshots taken');
			const localVideoScreenshotPath = 'uploads/' + fileData.file.filename + '.png';
			if (config.cloud_storage === 'gcloud') {
				var bucket = 'gs://' + config.storage_bucket + '/poster/' +
					fileData.file.filename.substring(0, 2) + '/' + fileData.file.filename.substring(2, 4) + '/' +
					fileData.file.filename + '.png';
				storage.copy('./' + localVideoScreenshotPath, bucket, function (err, url) {
					if (err) {
						logger.error('Error copying poster file:');
						logger.error(err);
						callback(null);
						return false;
					}
					logger.info('screenshots uploaded');
					callback(url);
				});
			} else {
				callback(config.local_cloud_storage_host + localVideoScreenshotPath);
			}
		})
		.screenshots({
			count: 1,
			filename: fileData.file.filename + '.png',
			folder: './uploads'
		});
}

function generateHash(fileData, callback) {
	Integrity.hash(fileData.path, function(hash) {
		callback(hash);
	});
}

function unlink(path) {
	fs.unlink('./' + path, function(fserr) {
		if(fserr) {
			console.error('Remove image error:');
			console.error(fserr);
		}
	});
}

function end(path, response, callback) {
	if (config.cloud_storage !== 'local_cloud') {
		unlink(path);
	}
	callback(response);
}
