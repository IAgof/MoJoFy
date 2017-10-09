const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const CloudStorage = require('cloud-storage');

const config = require('../../config');

const storage = new CloudStorage({
	accessId: config.storage_accessId,
	privateKey: config.storage_keyFilename
});


/* Exposed functions */

exports.move = move;


/* Internal functions */

function move(file, callback) {
	if(typeof(file) === 'undefined') {
		console.error('Undefined file');
		callback('error');
		return false;
	}

	const path = file.path.replace('\\', '/');	// Clean extrange bars in file path
	const fileDot = file.originalname.split('.');
	const fileExtension = fileDot[fileDot.length - 1].toLowerCase();
	const filetype = file.mimetype.split('/')[0];

	const response = {
		type: filetype,
		img: null,
		video: null
	};
	
	const bucket = 'gs://'+ config.storage_bucket +'/'+ config.storage_folder[filetype] +'/'+ file.filename.substring(0, 2) +'/'+ file.filename.substring(2, 4) +'/'+ file.filename +'.'+ fileExtension;
	// var bucket = 'gs://'+ config.storage_bucket +'/'+ file.filename +'.'+ fileExtension;
	// console.log(bucket);

	storage.copy('./'+ path, bucket, function(err, url) {
		
		if(err) {
			console.error('Error copying image file:');
			console.error(err);
			callback('error');
			return false;
		}

		// public url for your file 
		// console.log(url);

		if(filetype === 'video') {
			response.video = url;
			response.img = url;

			screenshots(file.filename, path, response, callback);
		} else {
			response.img = url;
			unlink(path);
			callback(response);
		}

	});
}

function screenshots(filename, path, response, callback) {

	new ffmpeg('./' + path)
		// .on('filenames', function(filenames) {
		// 	console.log('Will generate ' + filenames.join(', '));
		// })
		.on('end', function() {

			storage.copy('./uploads/'+ filename +'.png', 'gs://'+ config.storage_bucket +'/poster/'+ filename.substring(0, 2) +'/'+ filename.substring(2, 4) +'/'+ filename +'.png', function(err, url) {
				if(err) {
					console.error('Error copying poster file:');
					console.error(err);
					callback('error');
					return false;
				}

				// public url for your poster 
				// console.log(url);

				response.img = url;

				unlink(path);
				unlink('uploads/'+ filename +'.png');
				
				callback(response);
			});
		})
		.screenshots({
			count: 1,
			filename: filename + '.png',
			folder: './uploads'
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
