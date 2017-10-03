
// const Acl = require('./acl');
const Model = require('./model');
const Store = require('./store');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.update = update;
exports.query = query;


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

	// if(!data.owner) {
	// 	data.owner = token.sub;
	// }

	console.log(data);

	// Store file in a proper place ^^

	const model = Model.set(data);

	Store.upsert(model, function(result, id) {
		if(result, id) {
			model._id = id;
			delete model.password;
			callback(model, null, 201);
		} else {
			callback(null, 'Unable to add the video', 500);
		}
	});

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
			delete model.password;
			callback(model, null, 201);
		} else {
			callback(null, 'Unable to update the video', 500);
		}
	});

}

function list(token, callback) {
	query({}, token, callback);
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
				callback(result, null, 201);
			} else {
				callback(null, 'Unable to list videos', 500);
			}
		});
	// });
}
