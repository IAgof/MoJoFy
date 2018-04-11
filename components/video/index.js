const FileUpload = require('../file');

// const Acl = require('./acl');
const Model = require('./model');
const Store = require('./store');
const logger = require('../../logger');

const Like = require('../like');
const User = require('../user');
const DownloadCode = require('../download-code');
const Notifications = require('../email_notifications');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.update = update;
exports.remove = remove;
exports.query = query;
exports.count = count;
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
        Notifications.notifyVideoCodesGenerated(id, codes);
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
		FileUpload.move(data.file, function(uploaded, metadata) {
			data.video = uploaded.video;
			data.original = uploaded.video;
			data.poster = uploaded.img;
			data.date = new Date();

			setMetadata(data, metadata);

			const model = Model.set(data);
			logger.debug(model);

			Store.upsert(model, function(result, id) {
				if (result, id) {
					const video = Object.assign({}, model)
					video._id = id;
					generate_download_codes(id);
					notify_video_upload(video);
					User.updateVideoCounter(video.owner);
					callback(video, null, 201);
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

function list(token, callback, props) {
	logger.debug("Querying video list...");
	const params = {};

	if (props && typeof props === 'object') {

		if (props.limit && typeof props.limit === 'number' && props.limit >= 0) {
			params.limit = props.limit;
		}

		if (props.offset && typeof props.offset === 'number' && props.offset >= 0) {
			params.offset = props.offset;
		}

		if (props.order && typeof props.order === 'string') {
			params.orderBy = props.order;
		}

		if (props.tag && typeof props.tag === 'string') {
			if(!params.filters) {
				params.filters = [];
			}
			params.filters.push({
				field: 'tag',
				operator: '=',
				value: props.tag
			});
		}

		if (props.excludeTag && typeof props.excludeTag === 'string') {
			if(!params.filters) {
				params.filters = [];
			}

			params.filters.push({
				field: 'tag',
				operator: '!=',
				value: props.excludeTag
			});
		}

		if (props.user && typeof props.user === 'number' && props.user >= 0) {
			logger.debug("...for user ", props.user);
			if(!params.filters) {
				params.filters = [];
			}
			params.filters.push({
				field: 'owner',
				operator: '=',
				value: props.user
			});
		}

	}
	query(params, token, callback);

	/*
	// Token check for only mine... Deprecated?
	if (token && token.role === 'admin')  {
		console.log('An admin asked for all videos...');
	} else {
		var onlyMine = {
			field: 'owner',
			operator: '=',
			value: token.sub
		};

		if(!params.filters) {
			params.filters = [onlyMine];
		} else {
			params.filters.push(onlyMine);
		}
	}
	/**/
}

function like(id, token, callback) {

	const entity = {
		from: token.sub,
		entity: 'video',
		to: id
	};

	Like.add(entity, callback);
}

function getVideoOwner(result, token, callback) {
	let results = 0;
	for (var i = 0; i < result.length; i++) {
		delete result[i].original;
		const video = result[i];
		User.get(video.owner, token, function (data) {
			if (data) {
				video.ownerData = data;
			}
			if (++results === result.length) {
				callback(result, null, 200);
			}
		});
	}
}

function query(params, token, callback) {
	Store.list(params, function(result) {
		if(result) {
			getVideoOwner(result, token, callback);
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

function isDownloadable(id, code, owner, callback) {
	if (owner) {
		callback(true);
	} else {
		DownloadCode.isValid(id, code, function (valid) {
			if (valid) {
				callback(true);
			} else {
				callback(false);
			}
		});
	}
}

function download(id, code, owner, callback) {
	isDownloadable(id, code, owner, function (valid) {
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

function setMetadata(data, metadata) {
	if (!data || !metadata) {
		return false;
	}

	let videoStream = -1;
	for (var i = 0; i < metadata.streams.length; i++) {
		if(metadata.streams[i].codec_type === 'video') {
			videoStream = i;
			break;
		}
	}

	data.length = metadata.format.duration;
	data.size = metadata.format.size;
	if(videoStream > -1) {
		data.format = metadata.streams[videoStream].codec_name;
		data.dimensions = metadata.streams[videoStream].width + 'x' + metadata.streams[videoStream].height;
		data.ratio = metadata.streams[videoStream].display_aspect_ratio;
	}

	return data;
}

function count(query, callback) {
	Store.count(query, callback);
}
