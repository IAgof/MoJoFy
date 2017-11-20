const FileUpload = require('../file');

// const Acl = require('./acl');
const Model = require('./model');
const Store = require('./store');

const Like = require('../like');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.update = update;
exports.remove = remove;
exports.query = query;
exports.like = like;


// Internal functions

function get(id, token, callback) {

	Store.get(id, function(data) {
		if(data) {
			data._id = id;
			callback(data, null);
		} else {
			callback(null, 'That video does not exist', 404);
		}
	});
}

function add(data, token, callback) {

	if(!data.owner) {
		data.owner = token.sub;
	}

	if(data.file && data.file.mimetype && data.file.mimetype.split('/')[0] === 'video') {

		// Store file in a proper place ^^
		FileUpload.move(data.file, function(uploaded) {
			data.video = uploaded.video;
			data.poster = uploaded.img;

			const model = Model.set(data);

			console.log(model);

			Store.upsert(model, function(result, id) {
				if(result, id) {
					model._id = id;
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

function query(params, token, callback, includePass) {

	// Acl.query(token, 'list', function(success) {
		Store.list(params, function(result) {
			if(result) {
				for (var i = 0; i < result.length; i++) {
					// result[i]._id = id;
					if(!includePass) {
						delete result[i].password;
					}
				}
				callback(result, null, 200);
			} else {
				callback(null, 'Unable to list videos', 500);
			}
		});
	// });
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
