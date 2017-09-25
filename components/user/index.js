
const Acl = require('./acl');
const Store = require('./store');

exports.get = function(id, token, callback) {

	Store.get(id, function(data) {
		if(data) {

			delete data.password;
			delete data.password_hash;

			callback(data, null);
		} else {
			callback(null, 'That user does not exist', 404);
		}
	});
};

exports.list = function(token, callback) {

	Acl.query(token, 'list', function(success) {

		if(success) {
			callback([{user: 1234, name: 'Good question', bio: 'This data is hardcoded'}, {user: 1235, name: 'aGoodUser', bio: 'Yap. This user is also hardcoded...'}], null);
		} else {
			callback(null, 'You can\'t list users.', 403);
		}
	});

};