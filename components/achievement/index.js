
// const Acl = require('./acl');
const Model = require('./model');
const Pass = require('../access/password');
const Store = require('./store');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.update = update;
exports.query = query;


// Internal functions

function get(id, token, callback, includePass) {

	Store.get(id, function(data) {
		if(data) {
			data._id = id;
			if(!includePass) {
				delete data.password;
			}
			callback(data, null);
		} else {
			callback(null, 'That user does not exist', 404);
		}
	});
}

function add(data, token, callback) {

	prepare(data, function(model) {

		Store.upsert(model, function(result, id) {
			if(result, id) {
				model._id = id;
				delete model.password;
				callback(model, null, 201);
			} else {
				callback(null, 'Unable to add the user', 500);
			}
		});
	});

}

function update(data, token, callback) {

	if(!data.id && !data._id) {
		callback(null, 'No user id provided', 400);
	}

	prepare(data, function(model) {

		model._id = data.id || data._id;

		Store.upsert(model, function(result, id) {
			if(result, id) {
				model._id = id;
				delete model.password;
				callback(model, null, 201);
			} else {
				callback(null, 'Unable to update the user', 500);
			}
		});
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
				callback(null, 'Unable to list users', 500);
			}
		});
	// });
}

function prepare(data, next) {
	const model = Model.set(data);

	// Check if pasword shall be created
	if(typeof(data.password) !== 'undefined') {
		Pass.crypt(data.password, function(err, hash) {
			model.password = hash;
			next(model);
		});
	} else {
		next(model);
	}
}
