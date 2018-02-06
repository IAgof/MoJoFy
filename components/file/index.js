const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const CloudStorage = require('cloud-storage');

const config = require('../../config/config');

const Integrity = require('./integrity');

const storage = new CloudStorage({
	accessId: config.storage_accessId,
	privateKey: config.storage_keyFilename
});


/* Exposed functions */

exports.move = uploadFile;


/* Internal functions */

function uploadFile(file, callback) {
	
	if(typeof(file) === 'undefined') {
		console.error('Undefined file');
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

	if(filetype === 'video') {
		ops = 3;
		screenshots(fileData, response, function() {
			if(++responses === ops) {
				end(path, response, callback);
			}
		});	
	}

	move(fileData, response, function() {
		if(++responses === ops) {
			end(path, response, callback);
		}
	});

	hash(fileData, response, function() {
		if(++responses === ops) {
			end(path, response, callback);
		}
	});
}


function move(fileData, response, callback) {

	const bucket = 'gs://'+ config.storage_bucket +'/'+ config.storage_folder[fileData.type] +'/'+ fileData.file.filename.substring(0, 2) +'/'+ fileData.file.filename.substring(2, 4) +'/'+ fileData.file.filename +'.'+ fileData.extension;

	console.log('Moving to google cloud', bucket);

	storage.copy('./'+ fileData.path, bucket, function(err, url) {
		if(err) {
			console.error('Error copying image file:');
			console.error(err);
			callback('error');
			return false;
		}

		console.log('file uploaded');

		if(fileData.type === 'video') {
			response.video = url;
		} else {
			response.img = url;
		}

		callback(response);
	});
}

function screenshots(fileData, response, callback) {

	new ffmpeg('./' + fileData.path)
		.on('end', function() {
			console.log('screenshots taken');
			storage.copy('./uploads/'+ fileData.file.filename +'.png', 'gs://'+ config.storage_bucket +'/poster/'+ fileData.file.filename.substring(0, 2) +'/'+ fileData.file.filename.substring(2, 4) +'/'+ fileData.file.filename +'.png', function(err, url) {
				if(err) {
					console.error('Error copying poster file:');
					console.error(err);
					callback('error');
					return false;
				}

				console.log('screenshots uploaded');

				response.img = url;
				callback(response);
			});
		})
		.screenshots({
			count: 1,
			filename: fileData.file.filename + '.png',
			folder: './uploads'
		});
}

function hash(fileData, response, callback) {
	Integrity.hash(fileData.path, function(hash) {
		response.hash = hash;
		callback(response);
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
	unlink(path);
	callback(response);
}
