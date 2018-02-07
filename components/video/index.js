const FileUpload = require('../file');

// const Acl = require('./acl');
const Model = require('./model');
const Store = require('./store');
const logger = require('../../logger');

const Like = require('../like');
const DownloadCode = require('../download-code');
const Notifications = require('../email_notifications');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.update = update;
exports.remove = remove;
exports.query = query;
exports.like = like;
exports.download = download;

const DEFAULT_CODES = 5;


// Internal functions

function get(id, callback, includeOriginal) {
	Store.get(id, function(data) {
		if(data) {
			data._id = id;
			if(!includeOriginal) {
				delete data.original;
			}

			callback(data, null);
		} else {
			callback(null, 'That video does not exist', 404);
		}
	});
}

function generate_download_codes(id) {
    DownloadCode.add(id, DEFAULT_CODES, function (codes) {
        logger.info('codes generated:', codes);
    });
}

function notify_video_upload(video) {
	Notifications.notifyVideoUploaded(video);
}

function add(data, token, callback) {
	if(!data.owner) {
		data.owner = token.sub;
	}

	if(data.file && data.file.mimetype && data.file.mimetype.split('/')[0] === 'video') {
		// Store file in a proper place ^^
		FileUpload.move(data.file, function(uploaded) {
			data.video = uploaded.video;
			data.original = uploaded.video;
			data.poster = uploaded.img;
			data.date = new Date();

			const model = Model.set(data);
			logger.debug(model);

			Store.upsert(model, function(result, id) {
				if (result, id) {
					model._id = id;
					generate_download_codes(id);
					notify_video_upload(model);
					callback(model, null, 201);
				} else {
					callback(null, 'Unable to add the video', 500);
				}
			});
		});
		
	} else {
		callback(null, 'Invalid video sent', 400);
	}


}

function update(data, token, callback) {

	if(!data.id && !data._id) {
		callback(null, 'No video id provided', 400);
	}

	const model = Model.set(data);

	model._id = data.id || data._id;

	Store.upsert(model, function(result, id) {
		if(result, id) {
			model._id = id;
			callback(model, null, 200);
		} else {
			callback(null, 'Unable to update the video', 500);
		}
	});

}

function list(token, callback) {

	const params = {};

	console.log(token);

	if(token && token.role === 'admin')  {
		console.log('An admin asked for all videos...');
	} else {
		params.filters = [{
			field: 'owner',
			operator: '=',
			value: token.sub
		}];
	}

	query(params, token, callback);
}

function like(id, token, callback) {

	const entity = {
		from: token.sub,
		entity: 'video',
		to: id
	};

	Like.add(entity, callback);
}

function query(params, token, callback) {
	Store.list(params, function(result) {
		if(result) {
			for (var i = 0; i < result.length; i++) {
				delete result[i].original;
			}
			callback(result, null, 200);
		} else {
			callback(null, 'Unable to list videos', 500);
		}
	});
}

function remove(id, token, callback) {

	Store.remove(id, function(data) {
		if(data) {
			data._id = id;
			callback(data, null);
		} else {
			callback(null, 'That video does not exist', 404);
		}
	});
}

function download(id, code, callback) {
	DownloadCode.isValid(id, code, function (valid) {
		if (valid) {
			get(id, function (video, error, code) {
				let responseUrl = null;
				if(!error && typeof video === 'object') {
					responseUrl = video.original || video.video;
				}
				callback(responseUrl, error, code);
			}, true);
		} else {
			callback(null, 'You are not allowed to download that video', 403);
		}
	});
}
