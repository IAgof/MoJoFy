
// const Acl = require('./acl');
const Model = require('./model');
const Store = require('./store');

// Exposed functions

exports.add = add;
exports.remove = remove;


// Internal functions

const likable = ['video'];

function add(data, token, callback) {

	var model = Model.set(data);

	if(likable.indexOf(model.entity) < 0) {
		callback(null, 'Invalid entity to like', 400);
		return false;
	}

	Store.upsert(model, function(result, id) {
		if(result, id) {
			model._id = id;
			callback(model, null, 201);
		} else {
			callback(null, 'Unable to add the user', 500);
		}
	});

}

function remove(id, token, callback) {
	Store.remove(id, function(data) {
		if(data) {
			callback({removed: true}, null, 200);
		} else {
			callback(null, 'That user does not exist', 404);
		}
	});
}
