const FileUpload = require('../file');

// const Acl = require('./acl');
const Model = require('./model');
const Store = require('./store');
const logger = require('../../logger');
const Config = require('../../config');

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
		if (data) {
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
		FileUpload.processUploadedVideo(data.file, function(uploaded, metadata) {
			addVideoData(data, uploaded, metadata);
			data.date = new Date();
			const model = Model.set(data);
			logger.debug(model);

			Store.upsert(model, function(result, id) {
				if (result, id) {
					const video = Object.assign({}, model)
					video._id = id;
					generate_download_codes(id);
					notify_video_upload(video);
					User.updateVideoCounter(video.owner);
					// TODO:(DevStarlight) 24/04/2018 We have set a timeout of 1000ms to give time to process the video 
					setTimeout(function () {
						callback(video, null, 201);
					}, 1000);
				} else {
					callback(null, 'Unable to add the video', 500);
				}
			});
		});

	} else {
		callback(null, 'Invalid video sent', 400);
	}
}

function addVideoData(data, uploaded, metadata) {
	data.video = uploaded.video;
	data.original = uploaded.video;
	data.poster = uploaded.img;

	setMetadata(data, metadata);
}

function update(data, token, callback) {
	if (!data.id && !data._id) {
		logger.error("Unable to update video without id!");
		return callback(null, 'No video id provided', 400);
	}
	// TODO(jliarte): seems a modelate bug
	if (data.date) {
		data.date = new Date(data.date);
	}
	// TODO - FIXME (jliarte): modelate errors with booleans!!
	if (typeof data.verified == "string" && data.verified !== undefined) {
		data.verified = (data.verified === 'true');
	}
	if (typeof data.featured == "string" && data.featured !== undefined) {
		data.featured = (data.featured === 'true');
	}
	if (typeof data.published == "string" && data.published !== undefined) {
		data.published = (data.published === 'true');
	}

	const model = Model.set(data);
	const videoId = data.id || data._id;
	model._id = data.id || data._id;

	// update data
	Store.upsert(model, function(result, id) {
		if (result, id) {
			logger.debug("video fields updated!");
			model._id = id;
			processNewFiles(data, videoId)
				.then(res => callback(model, null, 200))
				.catch(err => {
					result = {
						message: "Error updating video fields",
						errors: err
					};
					callback(model, result, 500)
				});
		} else {
			logger.error("Error updating video fields!");
			callback(null, { message: 'Unable to update the video' }, 500);
		}
	});
}

function processNewFiles(videoData, videoId) {
	let updatedFiles = {};
	if (videoData.files && videoData.files.length > 0) {
		updatedFiles = videoData.files.reduce((map, obj) => (map[obj.fieldname] = obj, map), {});
	}
	return new Promise((resolve, reject) => {
		if (!updatedFiles.newFile) {
			return resolve(updateNewPoster(updatedFiles, videoId));
		}
		logger.debug("-------------------- Setting new video file -------------------- ");
		FileUpload.processUploadedVideo(updatedFiles.newFile, function (uploaded, metadata) {
			logger.debug("New video file processed with results", uploaded);
			Store.get(videoId, video => {
				let oldVideo = video.video;
				let oldOriginal = video.original;
				let oldPoster = video.poster;
				video.id = videoId;
				addVideoData(video, uploaded, metadata);
				Store.upsert(video, result => {
					if (result) {
						FileUpload.removeFromCloudStorage(oldVideo);
						FileUpload.removeFromCloudStorage(oldOriginal);
						FileUpload.removeFromCloudStorage(oldPoster);
						resolve(updateNewPoster(updatedFiles, videoId));
					} else {
						reject({original: "Error updating video file"});
					}
				});
			});
		});

	});
}

function updateNewPoster(updatedFiles, videoId) {
	if (!updatedFiles.newPoster) {
		return;
	}
	logger.debug("-------------------- Setting new video poster -------------------- ");
	return FileUpload.moveUploadedFile(updatedFiles.newPoster, Config.storage_folder.poster)
		.then(url => {
			logger.debug("New poster processed with results", url);
			Store.get(videoId, video => {
				let oldPoster = video.poster;
				video.id = videoId;
				video.poster = url;
				Store.upsert(video, result => {
					if (result) {
						FileUpload.removeFromCloudStorage(oldPoster);
						return;
					} else {
						throw ({poster: "Error updating poster file"});
					}
				});
			});
		});
}

function list(user, callback, props) {
	logger.debug("Querying video list...");
	const params = {};
	let showOnlyPublishedVideos = Config.showOnlyPublishedVideos;
	// user is editor or it is in its own gallery
	if ((user != undefined) && (user.role == 'editor' || user.sub == props.user)) {
		showOnlyPublishedVideos = false;
	} 
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
			insertFilter('tag', '=', props.tag, params);
		}

		if (props.excludeTag && typeof props.excludeTag === 'string') {
			insertFilter('tag', '!=', props.excludeTag, params);
		}

		if (props.user) {
			logger.debug("...for user ", props.user);
			insertFilter('owner', '=', props.user, params);
		}

		if (props.featured !== undefined && typeof props.featured === 'boolean') {
			insertFilter('featured', '=', props.featured, params);
		}

		if (props.verified !== undefined && typeof props.verified === 'boolean') {
			insertFilter('verified', '=', props.verified, params);
		}

		if (props.q) {
			const fieldsToQuery = ['title', 'description', 'tag', 'locationName'];
			params.query = [];

			for (var i = 0; i < fieldsToQuery.length; i++) {
				const q = {
					field: fieldsToQuery[i],
					value: props.q
				}; 

				params.query.push(q);
			}
		}
		if (showOnlyPublishedVideos) {
			/** CAUTION! 
			 * 	This double denial is to avoid unexpected behaviour in search
			 *	for non-editor users. This condition avoid unpublished videos 
			 *	to appear. Using "published == true" will show all published 
			 *	videos, even not coincident with search query. This happens due
			 *	to = filters use "MUST" and != uses MUST_NOT in ElasticSearch.
			 */
			insertFilter('published', '!=', false, params);
		} else {
			if (props.published !== undefined && typeof props.published === 'boolean') {
				insertFilter('published', '=', props.published, params);
			}
		}
		
	}

	query(params, user, callback);

	/*
	// Token check for only mine... Deprecated?
	if (token && token.role === 'admin')  {
		logger.debug('An admin asked for all videos...');
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

function insertFilter(fieldName, operator, value, params) {
	if(!params.filters) {
		params.filters = [];
	}
	params.filters.push({
		field: fieldName,
		operator: operator,
		value: value
	});
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
	if (result.length === 0) {
		return callback(result, null, 200);
	}
	
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
