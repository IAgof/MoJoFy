
const Acl = require('./acl');
const Model = require('./model');
const Pass = require('./password');
const Store = require('./store');

// Exposed functions

exports.get = get;
exports.list = list;
exports.add = add;
exports.update = update;


// Internal functions

function get(id, token, callback) {

	Store.get(id, function(data) {
		if(data) {
			data._id = id;
			delete data.password;
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

	Store.list({}, function(result) {
		if(result) {
			for (var i = 0; i < result.length; i++) {
				// result[i]._id = id;
				delete result[i].password;
			}
			callback(result, null, 201);
		} else {
			callback(null, 'Unable to list users', 500);
		}
	});

	// Acl.query(token, 'list', function(success) {

	// 	if(success) {
	// 		callback([{user: 1234, name: 'Good question', bio: 'This data is hardcoded'}, {user: 1235, name: 'aGoodUser', bio: 'Yap. This user is also hardcoded...'}], null);
	// 	} else {
	// 		callback(null, 'You can\'t list users.', 403);
	// 	}
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
